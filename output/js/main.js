function document_ready(callback){
    // in case the document is already rendered
    if (document.readyState!='loading') callback();
    // modern browsers
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
    // IE <= 8
    else document.attachEvent('onreadystatechange', function(){
        if (document.readyState=='complete') callback();
    });
}
function template(toot) {
  var cur = `<article data-id="110094816034705350">
        <div class="info">
          <div class="avatar">
            <img src="http://placekitten.com/300/300" data-src="${toot.url}" alt="${toot.acct}"></div>
          <div class="user">
            <a href="${toot.url}" title="${toot.acct}">
              <span class="name">
                <bdi>${toot.name}</bdi>
              </span>
              <span class="acct">
                <bdi>(${toot.acct})</bdi>
              </span>
            </a>
          </div>
          <div class="datetime">
            <time datetime="${toot.created_at}" title="${toot.created_at}"><a href="${toot.url}">${toot.created_at}Mar 27, 2023, 12:39</a></time>
            <br>
          </div>
        </div>
      </div>
      <div class="content">
        ${toot.content}
      </div>
      <div class="permalink"><a href="?uri=${encodeURI(toot.url)}">Permalink</a></div>
    </article>
  `;
  return(cur);
}

document_ready(function() {
    var figures = document.querySelectorAll('figure')
    for (let figure of figures) {
        figure.addEventListener("click", function() {
            img = figure.querySelectorAll("img")[0];
            window.open(img.src, '_blank').focus();
        })
    }
    toots.sort((a, b) => {
    let fa = a.created_at,
        fb = b.created_at;

    if (fa < fb) {
        return 1;
    }
    if (fa > fb) {
        return -1;
    }
    return 0;
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    requested_url = decodeURI(urlParams.get("uri"));
    if (requested_url != "null") {
      toots = toots.filter(toot => toot.url === requested_url);
    }


    $('#pagination-container').pagination({
        dataSource: toots,
        pageSize: 15,
        pageRange: 0,
        callback: function(data, pagination) {
            var html = "";
            for (let i in data) {
                toot = data[i];
                html = html + template(toot);
            }
            $('#data-container').html(html);
        }
    })
});