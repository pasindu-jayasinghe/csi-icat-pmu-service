import {Sector} from "src/master-data/sector/sector.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Country } from "./country.entity";

@Entity({ name: 'country_sector' })
export class CountrySector extends BaseTrackingEntity {

    constructor() {
        super();
        this.createdBy = '';
        this.editedBy = '';
      }
 
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Country, country => country.countrysector)
    public country!: Country;

    @ManyToOne(() => Sector, sector => sector.countrysector)
    public sector!: Sector;

    /*
    @ManyToMany((type) => UserType, {
      eager: true,
      cascade: false,
    })


    @ManyToMany(() => UserType, userType => userType.learningmaterils)
    @JoinTable()
    userTypes?: UserType[];

    @ManyToMany(() => Sector, sector => sector.learningmaterils)
    @JoinTable()
    sectors?: Sector[];

*/



    		 	


}
