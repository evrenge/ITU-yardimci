window.addEventListener('load', function () {
    dataManager.onFileLoad = generateDropdowns;
    dataManager.readAllTextFiles();
})
