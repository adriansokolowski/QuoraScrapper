module.exports = function() {
    return new Promise((resolve, reject) => {
        const C_THREAD = '.pagedlist_item:not(.pagedlist_hidden)'; // question DOM element container
        const C_THREAD_TO_REMOVE = '.pagedlist_item:not(.pagedlist_hidden) .TO_REMOVE'; // question DOM element container REMOVE
        //const C_THREAD_DESCRIPTION = '.ui_qtext_truncated_text'; // answer DOM element
        const C_THREAD_DESCRIPTION = '.ui_qtext_para '; // answer DOM element



            console.log("Scrape");
        let page = 1;
        let answers = new Set(); 
        const PAUSE = 4000;
        function scrapeSingleThread (elThread) {
            try {
                elDescription = elThread.querySelector(C_THREAD_DESCRIPTION);
                var answer = elDescription.innerText.trim()

                answers.add({
                    answer
                });
            } catch (e) {
                console.log("Error capturing individual thread", e);
            }
        }

        function scrapeThreads() {
            const visibleThreads = document.querySelectorAll(C_THREAD);
            if (visibleThreads.length > 0) {
                Array.from(visibleThreads).forEach(scrapeSingleThread);
            } else {
            }
            return visibleThreads.length;
        }
        function clearList() {
            const toRemove = `${C_THREAD_TO_REMOVE}_${(page - 1)}`,
                toMark = `${C_THREAD_TO_REMOVE}_${(page)}`;
            try {

                document.querySelectorAll(toRemove)
                    .forEach(e => e.parentNode.removeChild(e));
                document.querySelectorAll(C_THREAD)
                    .forEach(e => e.className = toMark.replace(/\./g, ''));
            } catch (e) {
            }
        }

        function loadMore() {
            window.scrollTo(0, document.body.scrollHeight - 1900);
        }

        function loop() {
            if (scrapeThreads()) {
                try {
                    clearList();
                    loadMore();
                    page++;
                    setTimeout(loop, PAUSE)
                } catch (e) {
                    reject(e);
                }
            } else {
                resolve(Array.from(answers));
            }
        }
        loop();
    });
}