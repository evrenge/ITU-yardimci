function getFormValues(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)) {
        let formValue = decodeURIComponent(name[1]).replaceAll("+", " ");
        return formValue;
    }
}

function graphPrerequistoryGraph() {
    let semesters = dataManager.semesters[getFormValues("faculty")][getFormValues("program")][getFormValues("iteration")];
    let prereqGrapher = new PrerequisitoryGrapher(semesters);

    prereqGrapher.createGraph(() => {
        let parent = document.getElementById("mountNode");
        let size = [parent.clientWidth, parent.clientWidth * prereqGrapher.ASPECT_RATIO * 8];

        parent.clientHeight = size[1];

        return size;
    });
    prereqGrapher.graph.render();
}