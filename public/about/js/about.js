$(document).ready(function() {
    const branchSelect = $('#branchSelect');
    const mapIframe = $('#map');

    // Fetch the list of branches using AJAX
    $.ajax({
        url: '/branches/list', // Your API endpoint for fetching branches
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            populateBranchDropdown(data.branches);

            // Set the initial map location (assuming the first branch exists)
            const initialLocation = data.branches[0].address;
            setMapLocation(initialLocation);

            // Handle dropdown change event
            branchSelect.change(function() {
                const selectedLocation = $(this).val();
                setMapLocation(selectedLocation);
            });
        },
        error: function(error) {
            console.error('Error fetching branches:', error);
        }
    });

    // Function to populate the dropdown with branch data
    function populateBranchDropdown(branches) {
        branchSelect.empty(); // Clear existing options
        branches.forEach(branch => {
            const option = $('<option></option>').val(branch.address).text(branch.name);
            branchSelect.append(option);
        });
    }

    // Function to update the map location
    function setMapLocation(address) {
        const mapUrl = `https://maps.google.com/maps?q=${address}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
        mapIframe.attr('src', mapUrl);
    }
});
