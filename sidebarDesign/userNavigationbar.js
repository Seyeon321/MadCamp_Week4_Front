window.addEventListener('load', function () {
    const navItems = document.querySelectorAll('.nav-item');
    console.log("Navigation bar is set");

    // Function to set active class based on URL parameter
    function setActiveItem() {
        //const params = new URLSearchParams(window.location.search);
        //const activeId = params.get('id');
        const activeId = sessionStorage.getItem('activeNavItem');
        console.log("activeId:", activeId);
        if (activeId) {
            const activeItem = document.getElementById(activeId);
            if (activeItem) {
                navItems.forEach(nav => nav.classList.remove('active'));
                activeItem.classList.add('active');
                console.log("Active item set:", activeItem);
            }
        }
    }
    // Initial set up on page load
    setActiveItem();
    // Add event listeners to navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault();

            const itemId = this.id;
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            console.log('Item clicked:', this);

            sessionStorage.setItem('activeNavItem', itemId);

            // Add the active item's id to the URL parameters
            const link = this.querySelector('a');
            const url = new URL(link.href);
            // url.searchParams.set('id', itemId);
            window.history.pushState(null, '', url.toString());
            

            // Set the active item without refreshing the page
            setActiveItem();
            location.reload();
        });
    });
    // Handle browser navigation (back/forward)
    window.addEventListener('popstate', setActiveItem);
});
