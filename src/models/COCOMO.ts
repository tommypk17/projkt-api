import { IsNumber, IsString } from 'class-validator';
import { FileService } from '../services/FileService';
import {CocomoModelDocument} from "../firestore/models/CocomoModel.document";
import {CocomoRatingDocument} from "../firestore/models/CocomoRating.document";
import {Logger} from "@nestjs/common";

export class Cocomo {
  linesOfCode: number;

  a: number;
  b: number;
  c: number;
  d: number;

  requiredSoftwareReliability: number;
  sizeofApplicationDatabase: number;
  complexityOfProduct: number;
  runtimePerformanceConstraints: number;
  memoryConstraints: number;
  volatilityOfEnvironment: number;
  requiredTurnaroundTime: number;
  analystCapability: number;
  applicationExperience: number;
  softwareEngineerAbility: number;
  environmentExperience: number;
  programmingLanguageExperience: number;
  applicationOfSoftwareEngineeringMethods: number;
  useOfSoftwareTools: number;
  requiredDevelopmentSchedule: number;

  /**
   * Get calculated Cocomo based on current model's values.
   */
  calculate = (): CocomoResponse => {
    let logger: Logger = new Logger(Cocomo.name);
    logger.debug('COCOMO.calculate() calculating')
    const calculatedScores: number[] = [];
    Object.keys(this).forEach((v: string, i: number, a: string[]) => {
      if (this.isCocomoRatingField(v) && typeof this[v] == 'number') {
        const calculatedScore: number = this.calculateScore(
          this[v],
          this.linesOfCode,
          this.a,
          this.b,
        );
        calculatedScores.push(calculatedScore);
      }
    });
    const adjustedTime: number = this.calculateAdjustedTime(calculatedScores);
    const developmentTime: number = this.calculateDevelopmentTime(
      adjustedTime,
      this.c,
      this.d,
    );
    const staffingTime: number = this.calculateStaffingTime(
      adjustedTime,
      developmentTime,
    );
    const totalHours: number = this.calculateHours(developmentTime);
    let cocomoRes: CocomoResponse = new CocomoResponse(
        adjustedTime,
        developmentTime,
        staffingTime,
        totalHours,
    );
    logger.debug('COCOMO.calculate() finished calculation');
    return cocomoRes
  };

  /**
   * Determine if the fieldName is a COCOMO rating field or not.
   * @param fieldName
   */
  private isCocomoRatingField = (fieldName: string): boolean => {
    return (
      fieldName != 'linesOfCode' &&
      fieldName != 'model' &&
      fieldName != 'a' &&
      fieldName != 'b' &&
      fieldName != 'c' &&
      fieldName != 'd'
    );
  };

  /**
   * Get calculated score for individual rating
   * @param score
   * @param loc
   * @param a
   * @param b
   */
  private calculateScore = (
    score: number,
    loc: number,
    a: number,
    b: number,
  ): number => {
    return parseFloat((a * loc ** b * score).toPrecision(7));
  };

  /**
   * Get adjusted time based on all calculated scores
   * @param calculatedScores
   */
  private calculateAdjustedTime = (calculatedScores: number[]): number => {
    let adjustedTime = 0;
    calculatedScores.forEach((v: number, i: number, a: number[]) => {
      adjustedTime += v;
    });
    return adjustedTime / calculatedScores.length;
  };

  /**
   * Get total development time (months) from adjusted time
   * @param adjustedTime
   * @param c
   * @param d
   */
  private calculateDevelopmentTime = (
    adjustedTime: number,
    c: number,
    d: number,
  ): number => {
    return c * adjustedTime ** d;
  };

  /**
   * Get staffing time (months) based on development time & adjusted time
   * @param adjustedTime
   * @param developmentTime
   */
  private calculateStaffingTime = (
    adjustedTime: number,
    developmentTime: number,
  ): number => {
    return adjustedTime / developmentTime;
  };

  /**
   * Get total hours based on development time (months)
   * @param developmentTime
   */
  private calculateHours = (developmentTime: number): number => {
    return 40 * 4 * developmentTime;
  };

  /**
   * Static method to take in CocomoRequest and convert to a Cocomo model, with selected ratings converted to scores.
   * @param cocomoRequest
   */
  static fromRequest = (cocomoRequest: CocomoRequest, cocomoModelList: CocomoModelDocument[], cocomoRatingList: CocomoRatingDocument[]) => {
    let logger: Logger = new Logger(Cocomo.name);
    logger.debug('COCOMO.fromRequest() beginning conversion')
    const cocomo: Cocomo = new Cocomo();
    Object.keys(cocomoRequest).forEach((v: string, i: number, a: string[]) => {
      if (v != 'linesOfCode') {
        if (v == 'model') {
          const variableRatings = cocomoModelList.find(x => x.name).ratings;
          cocomo['a'] = variableRatings['a'];
          cocomo['b'] = variableRatings['b'];
          cocomo['c'] = variableRatings['c'];
          cocomo['d'] = variableRatings['d'];
        } else {
          const cocomoRating = cocomoRatingList.find(x => x.name == v).ratings
          cocomo[v] = cocomoRating[cocomoRequest[v]];
        }
      }
    });
    cocomo.linesOfCode = cocomoRequest.linesOfCode / 1000;
    logger.debug('COCOMO.fromRequest() ending conversion')
    return cocomo;
  };
}

export class CocomoResponse {
  constructor(
    adjustedTime: number,
    developmentTime: number,
    staffingTime: number,
    totalHours: number,
  ) {
    this.adjustedTime = adjustedTime;
    this.developmentTime = developmentTime;
    this.staffingTime = staffingTime;
    this.totalHours = totalHours;
  }
  adjustedTime: number;
  developmentTime: number;
  staffingTime: number;
  totalHours: number;
}

export class CocomoRequest {
  @IsNumber()
  linesOfCode: number;

  @IsString()
  model: string;

  @IsString()
  requiredSoftwareReliability: string;

  @IsString()
  sizeOfApplicationDatabase: string;

  @IsString()
  complexityOfProduct: string;

  @IsString()
  runtimePerformanceConstraints: string;

  @IsString()
  memoryConstraints: string;

  @IsString()
  volatilityOfEnvironment: string;

  @IsString()
  requiredTurnaroundTime: string;

  @IsString()
  analystCapability: string;

  @IsString()
  applicationExperience: string;

  @IsString()
  softwareEngineerAbility: string;

  @IsString()
  environmentExperience: string;

  @IsString()
  programmingLanguageExperience: string;

  @IsString()
  applicationOfSoftwareEngineeringMethods: string;

  @IsString()
  useOfSoftwareTools: string;

  @IsString()
  requiredDevelopmentSchedule: string;
}
