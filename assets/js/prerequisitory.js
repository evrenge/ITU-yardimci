function getFormValues(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)) {
        let formValue = decodeURIComponent(name[1]).replaceAll("+", " ");
        return formValue;
    }
}

function graphPrerequistoryGraph() {
    let semesters = dataManager.semesters[getFormValues("faculty")][getFormValues("program")][getFormValues("iteration")];
    let prereqGrapher = new PrerequisitoryGrapher(semesters);

    prereqGrapher.createGraph();
    prereqGrapher.graph.render();
}