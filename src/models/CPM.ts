import {IsArray, IsNumber, IsString} from "class-validator";
import {v4 as uuidv4} from 'uuid';

export class CriticalPath {
    private _nodes: CriticalPathNode[] = [];
    private _edges: CriticalPathEdge[] = [];
    private _isCalculated: boolean = false;

    constructor() {
        this._nodes.push(new CriticalPathNode('end', 0))
    }

    public static FromPOJO(nodes: any[], edges: any[]){
        let newPath = new CriticalPath();
        newPath._nodes = nodes;
        newPath._edges = edges;
        return newPath;
    }

    //need to read in from string and create new object
    public static FromString(obj: string): CriticalPath {
        let reconstructed = new CriticalPath();
        let temp = Object.assign({}, JSON.parse(obj));

        let allNodes: {key: string, node: CriticalPathNode}[] = [];

        temp._nodes.forEach(node => {
            allNodes.push({key: node.id, node: new CriticalPathNode(node.name, node.duration, node.id)});
        })

        temp._nodes.map(x => ({...x, previous: null})).forEach(node => {
            let previousEdges = temp._edges.filter(x => x.to == node.id);
            let previousNodes = temp._nodes.filter(x => previousEdges.some(y => y.from == x.id));
            if(node.name != 'end'){
                let found = allNodes.find(x => x.key == node.id);
                if(found){
                    if(previousNodes.length == 0) {
                        reconstructed.add(found.node);
                    }
                    else{
                        reconstructed.add(found.node, allNodes.filter(x => previousNodes.some(y => y.id == x.key)).map(x => x.node));
                    }
                }
            }
        });
        return reconstructed;
    }

    public static FakeCriticalPath(): CriticalPath {
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
        return cp;
    }

    find(name: string): CriticalPathNode | undefined {
        return this._nodes.find(x => x.name == name);
    }

    add(node: CriticalPathNode, previousNodes: CriticalPathNode[] | null = null) {
        if(previousNodes != null) {
            for(let prev of previousNodes){
                this._edges.push({to: node.id, from: prev.id});
            }
        }

        this._nodes.push(node)

        let end: CriticalPathNode = this._nodes.find(x => x.name == 'end');
        this._edges.forEach((edge, i) => {
            if(edge.to == end.id) this._edges.splice(i, 1);
        });

        let unlinkedNodes = this._nodes.filter(x => !this._edges.some(y => y.from == x.id) && x.id != end.id)
        unlinkedNodes.forEach(node => {
           this._edges.push({from: node.id, to: end.id})
        });
    }

    link(from: string, to: string): void {
        if(!this._nodes.some(x => x.id == from)) throw new Error(`Invalid From: ${from} is not a known node id`)
        if(!this._nodes.some(x => x.id == to)) throw new Error(`Invalid From: ${to} is not a known node id`)
        this._edges.push({from: from, to: to});
    }

    unlink(from: string, to: string): void {
        let found = this._edges.findIndex(x => x.from == from && x.to == to);
        if(found <= -1) throw new Error(`Invalid Edge: from:${from} to: ${to}`);

        this._edges.splice(found, 1);
    }

    remove(nodeId: string): void {
        //find all applicable edges
        this._edges.forEach((edge, i, a) => {
            if(edge.from == nodeId || edge.to == nodeId){
                this._edges.splice(i, 1);
            }
        });

        //find applicable node
        let nodeIdx = this._nodes.findIndex(x => x.id == nodeId);
        if(nodeIdx > -1) this._nodes.splice(nodeIdx, 1);
    }

    calculate(): CriticalPath {
        let currentLevel: CriticalPathNode[] = this.rootNodes;
        while(currentLevel.length > 0){
            for(let node of currentLevel){
                let previousNodes: CriticalPathNode[] = this.findPreviousNodes(node.id);
                //if we are at the root, just set to 0 start
                if(previousNodes.length == 0) {
                    node.earlyStart = 0;
                    node.earlyFinish = node.earlyStart + node.duration;
                }else{
                    //otherwise, set start to the largest previous start
                    //map reduce, create array of early finish, then select the largest of the options
                    node.earlyStart = previousNodes
                                            .map(x => x.earlyFinish)
                                            .reduce((x1, x2) => {
                                                return x1 > x2? x1: x2
                                            });
                    node.earlyFinish = node.earlyStart + node.duration;
                }
            }
            currentLevel = this.next(currentLevel);
        }

        //calculate the lateStart & lateFinish
        //this traverses from the last item to the beginning items
        currentLevel = [this.find('end')];
        let nextLevel: CriticalPathNode[] = []
        while(currentLevel.length > 0){
            nextLevel = [];
            for(let node of currentLevel){
                let previousNodes: CriticalPathNode[] = this.findPreviousNodes(node.id);
                let successors = this.successors(node);
                if(successors.length > 0){
                    node.lateFinish = successors.map(x => x.lateStart)
                        .reduce((x1, x2) => {
                            return x1 > x2? x2: x1
                        });
                    node.lateStart = node.lateFinish - node.duration;
                }else{
                    //if we are at the end, use the largest early finish as the lateStart
                    node.lateStart = previousNodes.map(x => x.earlyFinish)
                        .reduce((x1, x2) => {
                            return x1 > x2? x1: x2
                        });
                    node.lateFinish = node.lateStart + node.duration;
                }
                node.float = node.lateFinish - node.earlyFinish;

                if(previousNodes.length > 0) nextLevel = nextLevel.concat(previousNodes);
            }
            currentLevel = nextLevel;
        }
        this._isCalculated = true;
        return this;
    }

    get criticalPath(): CriticalPathNode[] {
        if(!this._isCalculated) throw Error('The critical path must first be calculated')
        return this._nodes.filter(x => x.float == 0);
    }

    get nodes(): CriticalPathNode[] {
        return this._nodes;
    }

    get edges(): CriticalPathEdge[] {
        return this._edges;
    }

    findPreviousNodes(id: string): CriticalPathNode[] {
        return this._nodes.filter(x => this._edges.some(y => y.to == id && y.from == x.id));
    }

    successors(node: CriticalPathNode): CriticalPathNode[] {
        if(node == null) return [];
        return this._nodes.filter(x => this.findPreviousNodes(x.id).some(y => y.id == node.id));
        return [];
    }

    next(level: CriticalPathNode[]): CriticalPathNode[] {
        let nextLevel: CriticalPathNode[] = [];
        nextLevel = this._nodes.filter(x => this.findPreviousNodes(x.id).some(y => level.some(z => y.id == z.id)));
        return nextLevel;
        return [];
    }

    get rootNodes(): CriticalPathNode[] {
        return this._nodes.filter(x => this.findPreviousNodes(x.id).length == 0);
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

    constructor(name: string, duration: number, id?: string) {
        if(id != undefined) this.id = id;
        else this.id = uuidv4();
        this.name = name;
        this.duration = duration;
    }
}

export class CriticalPathEdge {
    from: string;
    to: string;
}

export class CriticalPathNodeRequest {
    @IsString()
    name: string;

    @IsNumber()
    duration: number;

    @IsArray()
    previous: string[];
}

export class CriticalPathEdgeRequest {
    @IsString()
    from: string;

    @IsString()
    to: string;
}