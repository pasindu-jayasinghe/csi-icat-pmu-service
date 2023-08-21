import { Institution } from 'src/institution/institution.entity';
import { Sector } from 'src/master-data/sector/sector.entity';
import { BaseTrackingEntity } from 'src/shared/entities/base.tracking.entity';
import { MasterData } from 'src/shared/entities/master.data.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CountrySector } from './country-sector.entity';
import { countryStatus } from './country-status.entity';

@Entity({name: 'country'})
export class Country extends BaseTrackingEntity{
    
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  code: string;

  @Column({ default: null })
  code_extended: string;


  @Column({ default: null })
  name: string;

  @Column({ length: 300, default: null })
  description: string;

  @Column({ default: 1 })
  sortOrder: number;

  // @Column({ default: null })
  // submissions: string; // add as string for document upload

  // @Column({ default: null })
  // emissionSummary: string;

  // @Column({ default: null })
  // ndcDocuments: string;

  @Column({ default: null })
  isSystemUse: boolean;

  @Column({ default: null })
  isCA: boolean;

  @Column({ default: null })
  flagPath: string;

  @Column({ default: null })
  registeredDate: Date;

  
  @Column({ default: null })
  isMember: boolean;

 // @Column({ default: null })
 // isRegister: boolean;

  @Column({ default: null })  // enum 
  countryStatus: countryStatus;

  @Column({ default: null })
  region: string;

  @Column({ default: null })
  uniqueIdentification: string;

  @OneToMany(() => CountrySector, countrySector => countrySector.country)
  public countrysector!: CountrySector[];

  /*
  @ManyToMany((type) => Sector, {
    eager: true,
    cascade: false,
  })
  @JoinTable({ name: 'country_sector' })
  Sector?: Sector[];*/

  //new added
  @ManyToOne((type) => Institution, { eager: true })
  @JoinColumn()
  institution?: Institution;


  @Column({ default: null })
  climateActionModule: boolean;

  @Column({ default: null })
  ghgModule: boolean;

  @Column({ default: null })
  macModule: boolean;

  @Column({ default: null })
  dataCollectionModule: boolean;









}
