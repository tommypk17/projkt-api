import {IsNumber, IsString} from "class-validator";
import {v4 as uuidv4} from 'uuid';

export class CriticalPath {
    private _nodes: CriticalPathNode[] = [];
    private _edges: CriticalPathEdge[] = [];
    path: CriticalPathNode = null;

    //need to read in from string and create new object
    public static FromString(obj: string): CriticalPath {
        let reconstructed = new CriticalPath();
        let temp = Object.assign({}, JSON.parse(obj));

        let allNodes: {key: string, node: CriticalPathNode}[] = [];

        temp._nodes.forEach(node => {
            allNodes.push({key: node.id, node: new CriticalPathNode(node.name, node.duration)});
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
        //always create an end node
        let end: CriticalPathNode = this.path;
        if(end == null || end.name != 'end')  end = new CriticalPathNode('end', 0);

        if(previousNodes != null) {
            node.previous = previousNodes;
            for(let prev of previousNodes){
                this._edges.push({to: node.id, from: prev.id});
            }
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
        this._nodes.push(end);

        this._edges = this._edges.filter(x => x.to != end.id);
        this._edges.push({to: end.id, from: node.id});

        let unlinkedNodes = this._nodes.filter(x => !this._edges.some(y => y.from == x.id) && x.name != 'end')
        unlinkedNodes.forEach(node => {
           this._edges.push({from: node.id, to: end.id})
        });
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

        //calculate the lateStart & lateFinish
        //this traverses from the last item to the beginning items
        currentLevel = [this.path];
        let nextLevel: CriticalPathNode[] = []
        while(currentLevel.length > 0){
            nextLevel = [];
            for(let node of currentLevel){
                let successors = this.successors(node);
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
                node.float = node.lateFinish - node.earlyFinish;

                if(node.previous && node.previous.length > 0) nextLevel = nextLevel.concat(node.previous);
            }
            currentLevel = nextLevel;
        }
        return this;
    }

    get criticalPath(): CriticalPathNode {
        let criticalNodes: CriticalPathNode[] = this._nodes.filter(x => x.float == 0).map(x => ({...x, previous: null}));

        let currentLevel: CriticalPathNode[] = this.rootNodes;
        while(currentLevel.length > 0){
            for(let node of currentLevel){
                if(node.previous != null) node.previous = node.previous.filter(x => criticalNodes.some(y => y.id == x.id));
            }
            currentLevel = this.next(currentLevel);
        }

        return this.path;
    }

    get criticalPathNodes(): CriticalPathNode[] {
        return this._nodes.filter(x => x.float == 0).map(x => ({...x, previous: null}));
    }

    get nodes(): CriticalPathNode[] {
        return this._nodes.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.id === value.id
                ))
        ).map(x => ({...x, previous: null}));
    }

    get edges(): CriticalPathEdge[] {
        return this._edges;
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

export class CriticalPathEdge {
    from: string;
    to: string;
}

export class CriticalPathRequest {

}