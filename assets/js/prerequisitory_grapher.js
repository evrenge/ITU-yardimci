class PrerequisitoryGrapher {
    ASPECT_RATIO = .15;
    constructor(semesters) {
        this.semesters = semesters;
        this.graph = undefined;
        this.coordToNode = {};

        this.courses = [];
        for (let i = 0; i < this.semesters.length; i++)
            for (let j = 0; j < this.semesters[i].length; j++)
                this.courses.push(this.semesters[i][j]);
    }

    createGraph(calculateSize) {
        let [w, h] = calculateSize();
        this.graph = new G6.Graph({
            // String | HTMLElement, required, the id of DOM element or an HTML node
            container: 'mountNode',
            width: w,
            height: h,
        });

        let [nodes, edges] = this.getNodesAndEdges();
        this.graph.data({
            nodes: nodes,
            edges: edges,
        });

        this.updateGraphSize(w, h);
        window.onresize = () => {
            let [w, h] = calculateSize();
            this.updateGraphSize(w, h);
        }
    }

    updateGraphSize(w, h) {
        this.graph.changeSize(w, h);

        for (let i = 0; i < Object.keys(this.coordToNode).length; i++) {
            let coord = Object.keys(this.coordToNode)[i];
            let coords = coord.split(":")

            let nodePos = this.getNodePos(parseInt(coords[0].trim()), parseInt(coords[1].trim()), w, h);
            this.coordToNode[coord].x = nodePos[0];
            this.coordToNode[coord].y = nodePos[1];
            this.coordToNode[coord].size = this.getNodeSize(w);
            this.coordToNode[coord].labelCfg.style.fontSize = this.getNodeSize(w) * .15;
        }
        this.graph.refresh();
    }

    getNodePos(x, y, w, h) {
        let size = this.getNodeSize(w) + 2;
        y += .1;

        return [x * (w - 8) * .15 + size * .5, y * w * this.ASPECT_RATIO + size * .5];
    }

    getNodeSize(w) {
        return w * .1 * this.ASPECT_RATIO * 4;
    }

    getNodesAndEdges() {
        this.coordToNode = {};
        let nodes = [];
        let edges = [];
        for (let i = 0; i < this.semesters.length; i++) {
            for (let j = 0; j < this.semesters[i].length; j++) {
                let course = this.semesters[i][j];
                if (course.constructor.name === "CourseGroup") {
                    // TODO: Implement Selective Courses.
                    continue;
                }

                let node = this.getNode(course, j, i);
                this.coordToNode[j.toString() + ":" + i.toString()] = node;
                nodes.push(node);

                if (course.requirements == undefined) continue;
                for (let y = 0; y < course.requirements.length; y++) {
                    for (let x = 0; x < course.requirements[y].length; x++) {
                        const requiredCourse = course.requirements[y][x];
                        if (this.courses.includes(requiredCourse) && !this.semesters[i].includes(requiredCourse)) {
                            edges.push(this.getEdge(this.courseToNodeId(requiredCourse), this.courseToNodeId(course)))
                            break;
                        }
                    }
                }
            }
        }

        return [nodes, edges];
    }

    getEdges() {
        for (let i = 0; i < this.semesters.length; i++) {
            for (let j = 0; j < this.semesters[i].length; j++) {
                let course = this.semesters[i][j];
                if (course.constructor.name === "CourseGroup") {
                    // TODO: Implement Selective Courses.
                    continue;
                }

            }
        }

        return edges;
    }

    courseToNodeId(course) {
        return course.courseCode.toLowerCase().replace(" ", "");
    }

    getNode(course, x, y) {
        return {
            id: this.courseToNodeId(course), // String, unique and required
            x: x, // Number, the x coordinate
            y: y, // Number, the y coordinate
            label: course.courseCode, // The label of the node
            size: 50,
            type: "circle",
            style: {
                fill: 'steelblue', // The filling color of nodes
                stroke: 'grey', // The stroke color of nodes
                lineWidth: 2, // The line width of the stroke of nodes
            },
            labelCfg: {
                position: 'center',
                style: {
                    fill: "white",
                    fontSize: 20,
                },
            },
        }
    }

    getEdge(s, t) {
        return {
            source: s,
            target: t,
            type: 'cubic-vertical',
            style: {
                endArrow: true,
                lineWidth: 1,
                stroke: 'grey',
                // lineDash: [5],
            },
        }
    }
}