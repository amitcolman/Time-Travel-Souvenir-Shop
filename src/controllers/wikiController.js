async function fetchOnThisDayData(req, res) {
    let today = new Date();
    let month = String(today.getMonth() + 1).padStart(2,'0');
    let day = String(today.getDate()).padStart(2,'0');
    let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`;

    try {
        let response = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + process.env.WIKIPEDIA_API_ACCESS_TOKEN,
                'Api-User-Agent': 'colman_web_proj',
            },
        });
        let data = await response.json();

        
        if (data.events && data.events.length > 0) {
            const randomEvent = data.events[Math.floor(Math.random() * data.events.length)];
            res.json({
                year: randomEvent.year,
                text: randomEvent.text,
                imageUrl: randomEvent.pages && randomEvent.pages[0].thumbnail && randomEvent.pages[0].thumbnail.source,
                pageUrl: randomEvent.pages && randomEvent.pages[0].content_urls.desktop.page
            });
        } else {
            res.status(404).json({ message: 'No events found for this date.' });
            console.error('No events found for url ', url);
        }
    } catch (error) {
        console.error('Error fetching On This Day data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
}

module.exports = {
    fetchOnThisDayData,
};
