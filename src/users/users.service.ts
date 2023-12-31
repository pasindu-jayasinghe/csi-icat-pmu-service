import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { count } from 'console';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import * as bcript from 'bcrypt';
import { ResetPassword } from 'src/auth/Dto/reset.password.dto';
import { RSA_PSS_SALTLEN_MAX_SIGN } from 'constants';
import { UserType } from './user.type.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Institution } from 'src/institution/institution.entity';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { EmailNotificationService } from 'src/notifications/email.notification.service';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Country } from 'src/country/entity/country.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { InstitutionCategory } from 'src/institution/institution.category.entity';
import { InstitutionType } from 'src/institution/institution.type.entity';

const { v4: uuidv4 } = require('uuid');

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User) repo,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
    @InjectRepository(UserType)
    private readonly usersTypeRepository: Repository<UserType>,
    private readonly emaiService: EmailNotificationService,
    private configService: ConfigService,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
  ) {
    super(repo);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    //console.log("CreateUser=====",createUserDto.institution['id'])
    //console.log("CreateUserwwwwww=====",createUserDto.userType['id'])
    console.log("CreateUserYYY=====",createUserDto)

    let userType = await this.usersTypeRepository.findOne(
      createUserDto.userType['id'],
    );

    // let institution;
    // if(createUserDto.userType['id'] == 3)
    
    // {
      
    //    institution = await this.institutionRepository.findOne(
    //     createUserDto.institution['id'],
    //   );
  
    // }
    let countryId = null;
    let insId = null;
    if(createUserDto.userType['id'] == 3){
      console.log("okkkkkkkk")
      countryId = null;
      insId = createUserDto.institution['id'];
      console.log("Hi==",countryId)  
    }
    else if(createUserDto.userType['id'] == 2){
      countryId = createUserDto.country['id'];
      insId = 0;
      let cou = await this.countryRepo.findOne(countryId);
      cou.isCA =true;
      this.countryRepo.save(cou)
    }

    else if(createUserDto.userType['id'] == 1){
      countryId = null;
      insId = createUserDto.institution['id'];
    }

    else if(createUserDto.userType['id'] == 5){
      countryId = null;
      insId = createUserDto.institution['id'];
    }


    let institution = await this.institutionRepository.findOne(
      insId
    );

    //To-do get country id from current context

    // let countryId = createUserDto.country['id'];
   // let countryId = 1;
    let country = await this.countryRepo.findOne(countryId);

    let newUser = new User();

    newUser.firstName = createUserDto.firstName;
    newUser.lastName = createUserDto.lastName;
    newUser.username = createUserDto.username;
    newUser.email = createUserDto.email;
    newUser.mobile = createUserDto.mobile;
    newUser.status = RecordStatus.Active;
    newUser.telephone = createUserDto.telephone;
    newUser.userType = userType;
    newUser.institution = institution;
    newUser.country = country;
    newUser.mrvInstitution = createUserDto.mrvInstitution;
    newUser.salt = await bcript.genSalt();

    let newUUID = uuidv4();
    let newPassword = ('' + newUUID).substr(0, 6);
    createUserDto.password = newPassword;
    newUser.password = await this.hashPassword(
      createUserDto.password,
      newUser.salt,
    );
    newUser.resetToken = '';

    var newUserDb = await this.usersRepository.save(newUser);
    // get an environment variable
    let systemLoginUrl='';
    if(newUser.userType.id ==2){
      let url= "https://icat-ca-tool.climatesi.com/icat-country-app/"
       systemLoginUrl = url//this.configService.get<string>("https://icat-ca-tool.climatesi.com/icat-country-app/");
    }
    else{
      let url= "https://icat-ca-tool.climatesi.com/pmu-app/login"
       systemLoginUrl =url// this.configService.get<string>('LOGIN_URL');
    }

    var template =
      'Dear ' +
      newUserDb.firstName +
      ' ' +
      newUserDb.lastName +
      ' <br/>Your username is ' +
      newUserDb.email +
      ' and your login password is : ' +
      newPassword +
      ' <br/>System login url is'+' <a href="' +systemLoginUrl + '">'+systemLoginUrl+'</a>'+
      '<br/>' +
      '<br/>Best regards'+ 
      '<br/>Software support team';

    // sned email with new password
    this.emaiService.sendMail(
      newUserDb.email,
      'Your credentials for ICAT system',
      '',
      template,
    );

    newUserDb.password = '';
    newUserDb.salt = '';

    return newUserDb;
  }


  async chnageStatus(userId: number, status: number): Promise<User> {
    let user = await this.usersRepository.findOne(userId);
    user.status = status;
    return this.usersRepository.save(user);
  }
  
  async chnagePassword(userId: number, newPassword: string): Promise<User> {
    let user = await this.usersRepository.findOne(userId);
    user.password = newPassword;
    return this.usersRepository.save(user);
  }

  async updateChnagePasswordToken(
    userId: number,
    newToken: string,
  ): Promise<User> {
    let systemLoginUrl = this.configService.get<string>('LOGIN_URL');
    let user = await this.usersRepository.findOne(userId);
    user.resetToken = newToken;
    let newUUID = uuidv4();
    let newPassword = ('' + newUUID).substr(0, 6);
    user.password = await this.hashPassword(
      user.password,
      user.salt,
    );
    user.password =newPassword;
    this.usersRepository.save(user);

    var template =
    'Dear ' + user.firstName +" "+ user.lastName+
    ' <br/>Your username is ' +
    user.email +
    '<br/> your login password is : ' +
    newPassword +
    ' <br/>System login url is ' +'<a href="systemLoginUrl">'+
    systemLoginUrl;

    this.emaiService.sendMail(
      user.email,
      'Your credentials for ICAT system',
      '',
      template,
    );
  
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    console.log("urepo====",this.usersRepository.find())
    return this.usersRepository.find();
  }

  findByUserName(userName: string): Promise<User> {
    return this.usersRepository.findOne({ username: userName });
  }

  async validateUser(userName: string, password: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ username: userName });

    console.log(user);

    return (await user).validatePassword(password);
  }

  // findOne(id: string): Promise<User> {
  //   return this.usersRepository.findOne(id);
  // }

  async isUserAvailable(userName: string): Promise<any> {
    // await this.usersRepository.count({username: userName}).then((value)=>{
    //   if(value>0){
    //     return true;
    //   }
    //   else{ 
    //     return false;
    //   }
    // }).catch(()=>{
    //   return false;
    // });
    let user = await this.usersRepository.findOne({ username: userName });
    if (user) {
      console.log('UsersService.findByUserName : true ===============');

      return user;
    } else {
      console.log('UsersService.findByUserName : false ===============');

      return user;
    }
  }

  async findUserByUserName(userName: string): Promise<any> {
    return await this.usersRepository
      .findOne({ username: userName })
      .then((value) => {
        console.log(value);
        if (!!value) {
          console.log('inside', value.id);

          return value.id;
        } else {
          return 0;
        }
      })
      .catch(() => {
        return 0;
      });
  }

  async findUserByEmail(email: string): Promise<any> {
    return await this.usersRepository
      .findOne({ email: email })
      .then((value) => {
        console.log(value);
        if (!!value) {
          console.log('inside', value.id);

          return value;
        } else {
          return false;
        }
      })
      .catch((e) => {
        console.log('findUserByEmail error', e);
        return false;
      });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id + '');
  }

  async validateResetPasswordRequest(
    email: string,
    token: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({ email: email });
    console.log(user);

    if (user && user.resetToken === token) {
      console.log('in if ');

      return true;
    } else {
      console.log('in else');

      return false;
    }
  }

  async resetPassword(email: string, password: string): Promise<boolean> {
    let user = await this.usersRepository.findOne({ email: email });
    console.log(user);
    if (user) {
      let salt = await bcript.genSalt();
      console.log('password', password, 'salt', salt);
      user.salt = salt;
      user.password = await this.hashPassword(password, salt);
      console.log('inside success');

      await this.usersRepository.save(user);

      console.log('inside success2');

      await this.updateChnagePasswordToken(user.id, ''); // clean the tocken

      console.log('inside success3');

      return true;
    }
    console.log('inside fail');

    return false;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return await bcript.hash(password, salt);
  }


  async getUserDetails(
    
    options: IPaginationOptions,
    filterText: string,
    userTypeId: number,
  ): Promise<Pagination<User>> {
    console.log('calling......')
    let filter: string = '';

    if(filterText != null && filterText != undefined && filterText != ''){
      filter = 
      '(user.firstName LIKE :filterText OR user.lastName LIKE :filterText OR user.telephone LIKE :filterText OR user.email LIKE :filterText OR ins.name LIKE :filterText OR type.name LIKE :filterText)'
    }

    if(userTypeId !=0){
      if(filter){
        filter = `${filter} and user.userTypeId = :userTypeId`;
      }else{
        filter = `user.userTypeId = :userTypeId`;
      }
    }

    let data = this.repo
    .createQueryBuilder('user')
    .leftJoinAndMapOne('user.institution', Institution, 'ins','ins.id = user.institutionId',)
    .leftJoinAndMapOne('user.userType', UserType, 'type', 'type.id = user.userTypeId',)
    // .leftJoinAndMapOne('user.country',Country, 'con',)

    .where(filter, {
      filterText: `%${filterText}%`,
      userTypeId,
    }).orderBy('user.status','ASC');

    let resualt = await paginate(data, options);

    if(resualt){
    //  console.log('reaslt...',resualt)
      return resualt;
    }
  }

  async findUserByUserType() {
    console.log("sssssssss " );
    let data =await this.repo
    .createQueryBuilder('u')
    .select('*')
    .where(
      'u.userTypeId = 2'
    ).execute();
    // console.log("sssssssss ",data.execute() );
    return data;
  }

  

}

