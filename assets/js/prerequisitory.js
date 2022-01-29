function getFormValues(name) {
    var getValue = document.getElementById(name).selectedOptions[0].value;
    return getValue;
}

function graphPrerequistoryGraph() {
    let semesters = dataManager.semesters[getFormValues("faculty")][getFormValues("program")][getFormValues("iteration")];
    let prereqGrapher = new PrerequisitoryGrapher(semesters);

    prereqGrapher.createGraph(() => {
        let parent = document.getElementById("mountNode");
        let width = parent.clientWidth * .9;
        let size = [width, width * prereqGrapher.ASPECT_RATIO * 8];

        parent.clientHeight = size[1];

        return size;
    });
    prereqGrapher.graph.render();
}