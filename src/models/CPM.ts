import {IsNumber, IsString} from "class-validator";
import {v4 as uuidv4} from 'uuid';

export class CriticalPath {
    private _nodes: CriticalPathNode[] = [];
    path: CriticalPathNode = null;

    find(name: string): CriticalPathNode | undefined {
        return this._nodes.find(x => x.name == name);
    }
    add(node: CriticalPathNode, previousNodes: CriticalPathNode[] | null = null) {
        //always create an end node
        let end: CriticalPathNode = this.path;
        if(end == null || end.name != 'end')  end = new CriticalPathNode('end', 0);

        if(previousNodes != null) {
            node.previous = previousNodes;
        }

        //always add the recent add to end node
        if(end.previous == null) end.previous = [];

        if(previousNodes != null) {
            for(let previousNode of previousNodes){
                let toRemoveIdx = end.previous.findIndex(x => x.id == previousNode.id);
                if(toRemoveIdx > -1) end.previous.splice(toRemoveIdx, 1);
            }
        }

        end.previous.push(node);

        this.path = end;
        this._nodes.push(node)

        //remove any of the previous end nodes and add the most recent
        this._nodes = this._nodes.filter(x => x.name != 'end');
        this._nodes.push(end)
    }

    calculate(): CriticalPath {

        let currentLevel: CriticalPathNode[] = this.rootNodes;
        while(currentLevel.length > 0){
            for(let node of currentLevel){
                //if we are at the root, just set to 0 start
                if(node.previous == null) {
                    node.earlyStart = 0;
                    node.earlyFinish = node.earlyStart + node.duration;
                }else{
                    //otherwise, set start to the largest previous start
                    //map reduce, create array of early finish, then select the largest of the options
                    node.earlyStart = node.previous
                                            .map(x => x.earlyFinish)
                                            .reduce((x1, x2) => {
                                                return x1 > x2? x1: x2
                                            });
                    node.earlyFinish = node.earlyStart + node.duration;
                }
            }
            currentLevel = this.next(currentLevel);
        }

        // //calculate the end's early start & finish
        // this.path.earlyStart = this.path.previous.map(x => x.earlyStart)
        //     .reduce((x1, x2) => {
        //         return x1 > x2? x1: x2
        //     });
        // this.path.earlyFinish = this.path.previous.map(x => x.earlyFinish)
        //     .reduce((x1, x2) => {
        //         return x1 > x2? x1: x2
        //     });
        // //late finish & start of the end task will always be the earlyStart time (end task is a placeholder task)
        // this.path.lateStart = this.path.earlyStart;
        // this.path.lateFinish = this.path.earlyFinish;

        //calculate the lateStart & lateFinish
        //this traverses from the last item to the beginning items
        currentLevel = [this.path];
        let nextLevel: CriticalPathNode[] = []
        let count = 0;
        while(currentLevel.length > 0){
            nextLevel = [];
            for(let node of currentLevel){
                let successors = this.successors(node);
                if(node.name == 'J') console.log(successors)
                if(successors.length > 0){
                    node.lateFinish = successors.map(x => x.lateStart)
                        .reduce((x1, x2) => {
                            return x1 > x2? x2: x1
                        });
                    node.lateStart = node.lateFinish - node.duration;
                }else{
                    //if we are at the end, use the largest early finish as the lateStart
                    node.lateStart = node.previous.map(x => x.earlyFinish)
                        .reduce((x1, x2) => {
                            return x1 > x2? x1: x2
                        });
                    node.lateFinish = node.lateStart + node.duration;
                }
                if(node.previous && node.previous.length > 0) nextLevel = nextLevel.concat(node.previous);
            }
            currentLevel = nextLevel;
        }

        return this;
    }

    successors(node: CriticalPathNode): CriticalPathNode[] {
        if(node == null) return [];
        return this._nodes.filter(x => x.previous != null && x.previous.some(y => y.id == node.id));
    }

    next(level: CriticalPathNode[]): CriticalPathNode[] {
        let nextLevel: CriticalPathNode[] = [];
        nextLevel = this._nodes.filter(x => x.previous != null && x.previous.some(y => level.some(z => y.id == z.id)));
        return nextLevel;
    }

    get rootNodes(): CriticalPathNode[] {
        return this._nodes.filter(x => x.previous == null);
    }

    calculate_recurse(currentLevelNodes: CriticalPathNode[], previousNode: CriticalPathNode): CriticalPathNode {
        return null;
    }

    private nextLevel(roots: CriticalPathNode[]): CriticalPathNode[] {
        let level: CriticalPathNode[] = [];
        for(let root of roots){
            let levelNodes = this._nodes.filter(x => x.previous != null && x.previous.some(y => y.id == root.id));
            for(let levelNode of levelNodes) level.push(levelNode);
        }
        return level;
    }
}

export class CriticalPathNode {
    readonly id: string;
    name: string;
    duration: number;
    earlyStart: number;
    earlyFinish: number;
    lateStart: number;
    lateFinish: number;
    float: number;

    constructor(name: string, duration: number) {
        this.id = uuidv4();
        this.name = name;
        this.duration = duration;
        this.previous = null;
    }

    previous: CriticalPathNode[] | null;
}

export class CriticalPathNodeRequest {
    @IsString()
    name: string;

    @IsNumber()
    duration: number;

    @IsNumber()
    earlyStart: number;

    @IsNumber()
    earlyFinish: number;

    @IsNumber()
    lateStart: number;

    @IsNumber()
    lateFinish: number;

    @IsNumber()
    float: number;
}