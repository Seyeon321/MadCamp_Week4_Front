
window.addEventListener('load', function () {
    const navItems = document.querySelectorAll('.nav-item');
    console.log("Navigation bar is set");

    // Add event listeners to navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault();
            
            const itemId = this.id;
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            console.log('Item clicked:', this);

            // Add the active item's id to the URL parameters
            const link = this.querySelector('a');
            const url = new URL(link.href);
            url.searchParams.set('id', itemId);
            window.history.pushState(null, '', url.toString());
        });
    });

    // On page load, check the URL for the id parameter and set the active class
    const params = new URLSearchParams(window.location.search);
    const activeId = params.get('id');
    console.log("activeId:", activeId)
    if (activeId) {
        const activeItem = document.getElementById(activeId);
        console.log("activeItem", activeItem)
        if (activeItem) {
            navItems.forEach(nav => nav.classList.remove('active'));
            activeItem.classList.add('active');
        }
    }
});
