import { Controller,Get,Patch,Put,Query,Request, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud';
import { AuditService } from 'src/audit/audit.service';
import { AuditDto } from 'src/audit/dto/audit-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Repository } from 'typeorm';
import { CountryService } from './country.service';
import { CountrySector } from './entity/country-sector.entity';
import { countryStatus } from './entity/country-status.entity';
import { Country } from './entity/country.entity';

@Crud({
    model: {
      type: Country,
    },

  //   params: {
  //     id: {
  //         field: 'id',
  //         type: 'number',
  //         primary: false,
  //         disabled: true, // <= HERE
  //     },
  // },


    query: {
      join:{
        countrysector: {
          eager: true,
        },
        sector: {
          eager: true,
        },
        institution: {
          eager: true,
        }
      },
    },
  })

@Controller('country')
export class CountryController implements CrudController<Country>{

    constructor(
      public service: CountryService,
      @InjectRepository(Country)
      public CountryRepo: Repository<Country>,
      @InjectRepository(CountrySector)
      public CountrySectorRepo: Repository<CountrySector>,
      private readonly auditService: AuditService,


      ){}

    get base(): CrudController<Country> {
      return this;
    }
    
    @UseGuards(JwtAuthGuard)
    @Override()
    async createOne(
      @Request() request,
      @ParsedRequest() req: CrudRequest,
      @ParsedBody() dto: Country,
    ): Promise<Country> {
     
       dto.isSystemUse = true;

        var x:number = 0        
        console.log('connn',dto)
        dto.countrysector.map((a) => {

           a.country.id = dto.id;
           a.sector.id = dto.countrysector[x].sector.id
           x++;
          
         });
         

         try {
          dto.countrysector.map(async (a) => {
            let lms = await this.CountrySectorRepo.save(await a);
          });
        } catch (error) {
          console.log(error);
        }

        let coun = await this.base.createOneBase(req, dto);



       

        let audit: AuditDto = new AuditDto();
        audit.action = coun.name+' Country Activated';
        audit.comment = "Country Activated";
        audit.actionStatus = 'Activated';
        this.auditService.create(audit);
        console.log("audit.......",audit);

       
       console.log("act-country===",coun)
        return coun;
    }


    @Override()
    async updateOne(
      @Request() request,
      @ParsedRequest() req: CrudRequest,
      @ParsedBody() dto: Country,
    ): Promise<Country> {
     
       dto.isSystemUse = true;

        var x:number = 0        
        console.log('connn',dto)
        dto.countrysector.map((a) => {

           a.country.id = dto.id;
           a.sector.id = dto.countrysector[x].sector.id
           x++;
          
         });
         

         try {
          dto.countrysector.map(async (a) => {
            let lms = await this.CountrySectorRepo.save(await a);
          });
        } catch (error) {
          console.log(error);
        }

        let coun = await this.base.updateOneBase(req, dto);

        return coun;


    }

    

    @Get('country1')
    async getCountry(
     @Query('countryId') countryId: number,
    ): Promise<any> {
      return await this.service.getCountry(countryId);
    }


    
  @Put('countryactivation1')
  changeStatus( @Query('cid') cid:number, @Query('status') status:countryStatus): Promise<Country> {
   // console.log('cid-----',Number.parseInt(cid+''))

   console.log('status-----',status)
   
    return this.service.chnageCountryStatus(cid,status);
  }
    

}
