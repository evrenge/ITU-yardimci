class PrerequisitoryGrapher {
    constructor(semesters) {
        this.semesters = semesters;
        this.graph = undefined;

        this.courses = [];
        for (let i = 0; i < this.semesters.length; i++)
            for (let j = 0; j < this.semesters[i].length; j++)
                this.courses.push(this.semesters[i][j]);
    }

    createGraph() {
        this.graph = new G6.Graph({
            container: 'mountNode', // String | HTMLElement, required, the id of DOM element or an HTML node
            width: 800, // Number, required, the width of the graph
            height: 1000, // Number, required, the height of the graph
        });

        let [nodes, edges] = this.getNodesAndEdges();
        this.graph.data({
            nodes: nodes,
            edges: edges,
        }); // Load the data defined in Step 2
    }

    getNodesAndEdges() {
        let nodes = [];
        let edges = [];
        for (let i = 0; i < this.semesters.length; i++) {
            for (let j = 0; j < this.semesters[i].length; j++) {
                let course = this.semesters[i][j];
                if (course.constructor.name === "CourseGroup") {
                    // TODO: Implement Selective Courses.
                    continue;
                }
                nodes.push(this.getNode(course, (j + 1) * 95, (i + 1) * 120));
                if (course.requirements == undefined) continue;
                for (let k = 0; k < course.requirements.length; k++) {
                    for (let l = 0; l < course.requirements[k].length; l++) {
                        const requiredCourse = course.requirements[k][l];
                        if (this.courses.includes(requiredCourse)) {
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
            type: "ellipse",
            style: {
                fill: 'steelblue', // The filling color of nodes
                stroke: '#FFF', // The stroke color of nodes
                lineWidth: 2, // The line width of the stroke of nodes
            },
            linkPoints: {
                top: true,
                bottom: true,
                left: true,
                right: true,
            },
        }
    }

    getEdge(s, t) {
        return {
            source: s,
            target: t,
        }
    }
}