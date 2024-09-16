document.addEventListener('DOMContentLoaded', function() {
    const branchSelect = document.getElementById('branchSelect');
    const mapIframe = document.getElementById('map');

    fetch('/branches/list')
        .then(response => response.json())
        .then(data => {
            populateBranchDropdown(data.branches);

            const initialLocation = data.branches[0].address; // Assuming the first branch exists
            setMapLocation(initialLocation);

            branchSelect.addEventListener('change', function() {
                const selectedLocation = this.value;
                setMapLocation(selectedLocation);
            });
        })
        .catch(error => {
            console.error('Error fetching branches:', error);
        });

    function populateBranchDropdown(branches) {
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.address;
            option.textContent = branch.name;
            branchSelect.appendChild(option);
        });
    }

    function setMapLocation(address) {
        mapIframe.src = `https://maps.google.com/maps?q=${address}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
});
