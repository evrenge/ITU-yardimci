window.addEventListener('load', function () {
    dataManager.onFileLoad = graphPrerequistoryGraph;
    dataManager.readAllTextFiles();
})