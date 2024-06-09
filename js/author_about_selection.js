document.addEventListener('DOMContentLoaded', function() {
    const authorSelect = document.getElementById('author-select');

    // Add initial option indicating loading
    authorSelect.innerHTML = '<option value="" disabled selected>Loading authors...</option>';

    fetch('data/author_abt_filtered_authors.csv')
        .then(response => response.text())
        .then(data => {
            const authors = Papa.parse(data, { header: true }).data;
            console.log('Authors:', authors); // Debugging log

            // Clear the initial loading option
            authorSelect.innerHTML = '';
            authors.forEach(author => {
                const option = document.createElement('option');
                option.value = author.author_id;
                option.textContent = `${author.author_name} (${author.h_index})`;
                authorSelect.appendChild(option);
            });

            // Automatically select the first author
            if (authors.length > 0) {
                authorSelect.selectedIndex = 0;
                const firstAuthorId = authors[0].author_id;
                fetchAuthorInfo(firstAuthorId);
                fetchWorks(firstAuthorId);
            }
        });

    authorSelect.addEventListener('change', function() {
        const selectedAuthorId = this.value;
        console.log('Selected Author ID:', selectedAuthorId); // Debugging log
        if (selectedAuthorId) {
            fetchAuthorInfo(selectedAuthorId);
            fetchWorks(selectedAuthorId);
        } else {
            document.getElementById('author-info').innerHTML = '';
            document.getElementById('works-table').querySelector('tbody').innerHTML = '';
        }
    });
});

function fetchAuthorInfo(authorId) {
    fetch('data/author_abt_filtered_authors.csv')
        .then(response => response.text())
        .then(data => {
            const authors = Papa.parse(data, { header: true }).data;
            const author = authors.find(a => a.author_id === authorId);
            if (author) {
                let authorInfoHTML = '<div>';
                // if (author.author_name) {
                //     authorInfoHTML += `<p>作者名字: ${author.author_name}</p>`;
                // }
                if (author.author_institution) {
                    authorInfoHTML += `<p>作者机构: ${author.author_institution}</p>`;
                }
                if (author.author_institution_country) {
                    authorInfoHTML += `<p>作者国家: ${author.author_institution_country}</p>`;
                }
                if (author.h_index) {
                    authorInfoHTML += `<p>作者H指数: ${author.h_index}</p>`;
                }
                authorInfoHTML += '</div>';
                document.getElementById('author-info').innerHTML = authorInfoHTML;
            }
        });
}

function fetchWorks(authorId) {
    fetch('data/author_abt_filtered_works.csv')
        .then(response => response.text())
        .then(data => {
            const works = Papa.parse(data, { header: true }).data;
            console.log('Works Data:', works); // Debugging log
            const authorWorks = works.filter(work => work.author_id === authorId);
            console.log('Author Works:', authorWorks); // Debugging log
            const tbody = document.getElementById('works-table').querySelector('tbody');
            tbody.innerHTML = '';
            authorWorks.forEach(work => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${work.display_name}</td>
                    <td>${work.publication_date}</td>
                    <td>${work.cited_by_count}</td>
                    <td>${work.sdg}</td>
                    <td>${work.referenced_works_count}</td>
                    <td>${work.journal}</td>
                    <td>${work.doi}</td>
                `;
                tbody.appendChild(row);
            });
        });
}
