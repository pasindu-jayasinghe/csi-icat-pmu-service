import { CountrySector } from 'src/country/entity/country-sector.entity';
import { Country } from 'src/country/entity/country.entity';
import { LearningMaterialSector } from 'src/learning-material/entity/learning-material-sector.entity';
import { Methodology } from 'src/methodology/entity/methodology.entity';
import { BaseTrackingEntity } from 'src/shared/entities/base.tracking.entity';
import {
  Entity,
  ManyToMany,
  JoinTable,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { SubSector } from '../sub-sector/entity/sub-sector.entity';
//import { ClimateChangeDataCategory } from '../cimate-change-data-category/climate.change.data.category.entity';

@Entity({ name: 'sector' })
export class Sector extends BaseTrackingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  name: string;

  @Column({ length: 300, default: null })
  description: string;

  @Column({ default: 1 })
  sortOrder: number;
/*
  @ManyToMany((type) => Country, { cascade: false })
  @JoinTable({ name: 'country_sector' })
  country: Country;
*/

@OneToMany(() => CountrySector, countrySector => countrySector.sector)
public countrysector!: CountrySector[];

  @OneToMany(() => LearningMaterialSector,(learningMaterialSector) => learningMaterialSector.sector)
  public learningMaterialsector!: LearningMaterialSector[];

  @OneToMany(() => SubSector,(subSector) => subSector.sector)
  public subSector!: SubSector[];

  // @Column({ default: null })
  // emissionSummary: string;

  // @Column({ default: null })
  // ndcDocuments: string;

  @Column({ default: null })
  uniqueIdentification: string;
}
