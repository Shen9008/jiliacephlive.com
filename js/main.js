(function () {
    'use strict';
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        a.addEventListener('click', function (e) {
            var t = document.querySelector(id);
            if (t) {
                e.preventDefault();
                t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();
