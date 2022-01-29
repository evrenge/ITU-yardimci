prereqGrapher = undefined;

function getFormValues(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)) {
        let formValue = decodeURIComponent(name[1]).replaceAll("+", " ");
        return formValue;
    }
    return "";
}

function graphPrerequistoryGraph() {
    if (prereqGrapher != undefined) {
        prereqGrapher.graph.destroy();
    }

    let semesters = dataManager.semesters[getFormValues("faculty")][getFormValues("program")][getFormValues("iteration")];
    prereqGrapher = new PrerequisitoryGrapher(semesters);

    prereqGrapher.createGraph(() => {
        let parent = document.getElementById("mountNode");
        let width = parent.clientWidth * .9;
        let size = [width, prereqGrapher.calculateSemesterHeight(width) * 8];

        parent.clientHeight = size[1];

        return size;
    });
    prereqGrapher.graph.render();
}