import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Post,
    Query,
    Req,
    Request
} from '@nestjs/common';
import {CocomoModelsService} from "../../services/CocomoModels.service";
import {CocomoRatingsService} from "../../services/CocomoRatings.service";
import {UsersService} from "../../services/Users.service";
import {IAuthUser} from "../../authentication/models/authentication.models";
import {CriticalPath, CriticalPathNode} from "../../models/CPM";

@Controller('critical-paths')
export class CriticalPathsController {

    private readonly _usersService: UsersService;
    private logger: Logger = new Logger(CriticalPathsController.name);

    constructor(private usersService: UsersService) {
        this._usersService = usersService;
    }

    @Get('test')
    test(@Query('nodeName') nodeName: string | null, @Query('criticalPath') criticalPath: boolean | null, @Query('flatten') flatten: boolean | null, @Req() req: Request): any {
        let cpmA: CriticalPathNode = new CriticalPathNode('A', 2);
        let cpmB: CriticalPathNode = new CriticalPathNode('B', 4);
        let cpmC: CriticalPathNode = new CriticalPathNode('C', 10);
        let cpmD: CriticalPathNode = new CriticalPathNode('D', 6);
        let cpmE: CriticalPathNode = new CriticalPathNode('E', 4);
        let cpmF: CriticalPathNode = new CriticalPathNode('F', 5);
        let cpmG: CriticalPathNode = new CriticalPathNode('G', 7);
        let cpmH: CriticalPathNode = new CriticalPathNode('H', 9);
        let cpmI: CriticalPathNode = new CriticalPathNode('I', 7);
        let cpmJ: CriticalPathNode = new CriticalPathNode('J', 8);
        let cpmK: CriticalPathNode = new CriticalPathNode('K', 4);
        let cpmL: CriticalPathNode = new CriticalPathNode('L', 5);
        let cpmM: CriticalPathNode = new CriticalPathNode('M', 2);
        let cpmN: CriticalPathNode = new CriticalPathNode('N', 6);

        let cp: CriticalPath = new CriticalPath();
        cp.add(cpmA);
        cp.add(cpmB, [cpmA]);
        cp.add(cpmC, [cpmB]);
        cp.add(cpmD, [cpmC]);
        cp.add(cpmE, [cpmC]);
        cp.add(cpmF, [cpmE]);
        cp.add(cpmG, [cpmD]);
        cp.add(cpmH, [cpmG, cpmE]);
        cp.add(cpmI, [cpmC]);
        cp.add(cpmJ, [cpmF, cpmI]);
        cp.add(cpmK, [cpmJ]);
        cp.add(cpmL, [cpmJ]);
        cp.add(cpmM, [cpmH]);
        cp.add(cpmN, [cpmK, cpmL]);

        if(criticalPath == true) return cp.criticalPath;
        if(flatten == true) return {nodes: cp.nodes, edges: cp.edges};
        cp.calculate();
        let res = {
            A: {
                es: cp.find('A').earlyStart == 0,
                ef: cp.find('A').earlyFinish == 2,
                ls: cp.find('A').lateStart == 0,
                lf: cp.find('A').lateFinish == 2
            },
            B: {
                es: cp.find('B').earlyStart == 2,
                ef: cp.find('B').earlyFinish == 6,
                ls: cp.find('B').lateStart == 2,
                lf: cp.find('B').lateFinish == 6
            },
            C: {
                es: cp.find('C').earlyStart == 6,
                ef: cp.find('C').earlyFinish == 16,
                ls: cp.find('C').lateStart == 6,
                lf: cp.find('C').lateFinish == 16
            },
            D: {
                es: cp.find('D').earlyStart == 16,
                ef: cp.find('D').earlyFinish == 22,
                ls: cp.find('D').lateStart == 20,
                lf: cp.find('D').lateFinish == 26
            },
            E: {
                es: cp.find('E').earlyStart == 16,
                ef: cp.find('E').earlyFinish == 20,
                ls: cp.find('E').lateStart == 16,
                lf: cp.find('E').lateFinish == 20
            },
            F: {
                es: cp.find('F').earlyStart == 20,
                ef: cp.find('F').earlyFinish == 25,
                ls: cp.find('F').lateStart == 20,
                lf: cp.find('F').lateFinish == 25
            },
            G: {
                es: cp.find('G').earlyStart == 22,
                ef: cp.find('G').earlyFinish == 29,
                ls: cp.find('G').lateStart == 26,
                lf: cp.find('G').lateFinish == 33
            },
            H: {
                es: cp.find('H').earlyStart == 29,
                ef: cp.find('H').earlyFinish == 38,
                ls: cp.find('H').lateStart == 33,
                lf: cp.find('H').lateFinish == 42
            },
            I: {
                es: cp.find('I').earlyStart == 16,
                ef: cp.find('I').earlyFinish == 23,
                ls: cp.find('I').lateStart == 18,
                lf: cp.find('I').lateFinish == 25
            },
            J: {
                es: cp.find('J').earlyStart == 25,
                ef: cp.find('J').earlyFinish == 33,
                ls: cp.find('J').lateStart == 25,
                lf: cp.find('J').lateFinish == 33
            },
            K: {
                es: cp.find('K').earlyStart == 33,
                ef: cp.find('K').earlyFinish == 37,
                ls: cp.find('K').lateStart == 34,
                lf: cp.find('K').lateFinish == 38
            },
            L: {
                es: cp.find('L').earlyStart == 33,
                ef: cp.find('L').earlyFinish == 38,
                ls: cp.find('L').lateStart == 33,
                lf: cp.find('L').lateFinish == 38
            },
            M: {
                es: cp.find('M').earlyStart == 38,
                ef: cp.find('M').earlyFinish == 40,
                ls: cp.find('M').lateStart == 42,
                lf: cp.find('M').lateFinish == 44
            },
            N: {
                es: cp.find('N').earlyStart == 38,
                ef: cp.find('N').earlyFinish == 44,
                ls: cp.find('N').lateStart == 38,
                lf: cp.find('N').lateFinish == 44
            },
            END: {
                es: cp.find('end').earlyStart == 44,
                ef: cp.find('end').earlyFinish == 44,
                ls: cp.find('end').lateStart == 44,
                lf: cp.find('end').lateFinish == 44
            },
        }
        // return res;
        if(nodeName != null) return cp.find(nodeName);
        return cp.path;
    }

    /**
     * Get rating names as list
     */
    @Get('mine')
    getSavedCriticalPaths(@Req() req: Request): any {
        return new Promise<any>((resolve) => {
            let user: IAuthUser = req['user'];
            if(!user) throw new HttpException('Error Getting Saved Critical Paths, not logged in', HttpStatus.FORBIDDEN);
            this._usersService.getSavedCriticalPaths(user.uid).then((res: any[]) => {
                resolve(res);
            });
        }).catch((err: any) => {
            this.logger.error(err);
            throw new HttpException('Error Getting Saved Critical Paths', HttpStatus.BAD_REQUEST);
        });
    }

    @Post('save')
    saveCriticalPath(@Body() criticalPathRequest: any, @Req() req: Request): any {
        return new Promise<any>((resolve) => {
            let user: IAuthUser = req['user'];
            if(!user) throw new HttpException('Error Saving Critical Path, not logged in', HttpStatus.FORBIDDEN);
            this._usersService.saveCriticalPath(user.uid, criticalPathRequest).then((res: boolean) => {
                resolve(res);
            });
        }).catch((err: any) => {
            this.logger.error(err);
            throw new HttpException('Error Getting Saved Critical Paths', HttpStatus.BAD_REQUEST);
        });
    }
}
