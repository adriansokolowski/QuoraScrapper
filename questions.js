module.exports = function() {
    return new Promise((resolve, reject) => {

        const C_THREAD = '.pagedlist_item:not(.pagedlist_hidden)';
        const C_THREAD_TO_REMOVE = '.pagedlist_item:not(.pagedlist_hidden) .TO_REMOVE';
        const C_THREAD_TITLE = '.title';
        const C_THREAD_ID = '.question_link';
        const A_THREAD_URL = 'href';
        let page = 1;
        let questions = new Set();
        const PAUSE = 4000;

        // Akceptuje nadrzędny element DOM i wyodrębnia tytuł i adres URL
        function scrapeSingleThread(elThread) {
            try {
                const elTitle = elThread.querySelector(C_THREAD_TITLE);
                const elLink = elThread.querySelector(C_THREAD_ID);
                if (elTitle) {
                    const title = elTitle.innerText.trim(),
                        
                        url = "https://www.quora.com/".concat(elLink.getAttribute(A_THREAD_URL));

                    questions.add({
                        title,
                        url
                    });
                }
            } catch (e) {
                console.log("Błąd podczas przechwytywania pojedynczego wątku "+ e);
            }
        }

        // Zbierz wszystkie wątki w widocznym kontekście
        function scrapeThreads() {
            console.log("Skrobanie strony "+ page);
            const visibleThreads = document.querySelectorAll(C_THREAD);

            if (visibleThreads.length > 0) {
                console.log("Skrobanie strony... znaleziono wątków "+ page+"/"+ visibleThreads.length);
                Array.from(visibleThreads).forEach(scrapeSingleThread);
            } else {
                console.log("Skrobanie strony... nie znalziono wątków "+ page);
            }

            // Zwraca główną listę wątków;
            return visibleThreads.length;
        }

        // Czyści listę stronicowania, aby zachować pamięć
        // W przeciwnym razie przeglądarka zacznie opóźniać się po około 1000 wątkach
        function clearList() {
            console.log("Czyszczenie strony listy "+ page);
            const toRemove = `${C_THREAD_TO_REMOVE}_${(page-1)}`,
                toMark = `${C_THREAD_TO_REMOVE}_${(page)}`;
            try {
                // Usuń wątki wcześniej oznaczone do usunięcia
                document.querySelectorAll(toRemove)
                    .forEach(e => e.parentNode.removeChild(e));

                // Oznacz widoczne wątki do usunięcia podczas następnej iteracji
                document.querySelectorAll(C_THREAD)
                    .forEach(e => e.className = toMark.replace(/\./g, ''));

            } catch (e) {
                console.log("Unable to remove elements "+ e.message)
            }
        }

        // Przewija do dolnej części rzutni
        function loadMore() {
            console.log("Load more... page "+ page);
            window.scrollTo(0, document.body.scrollHeight);
        }

        // Pętla rekurencyjna, która kończy się, gdy nie ma już nic
        function loop() {
            console.log("Looping... %d entries added "+ questions.size);
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
                console.log("Scrape");
                resolve(Array.from(questions));
                
            }
        }
        loop();
    });
}