/* eslint-disable require-jsdoc */
$(function() {
    tic = Date.now();
    // Main function (Run on page load, would be better to use backend but *ZenDesk*)
    Promise.all([getArticles, getModules]).then(function(values) { // On resolution of all promises
        articles = values[0];
        modules = values[1].modules;
        timestamp = values[1].date;
        //canon_domains = values[1].canon_domains;
        canon_domains=[];

        $('div#updated_timestamp').text(timestamp);
        mergeData();
        appendTable();
        getSearch();

        function mergeData() { // Parse and merge objects containing app info.
            articles.forEach(function(article) { // Link articles to corresponding application.
                if (modules.hasOwnProperty(article.name)) {
                    modules[article.name].support = article.link;
                } else {
                    console.log('Article ' + article.name + ' has no corresponding application!');
                    /* not true: Matlab Introduction article does not have an associated application*/
                }
            });
        }

        function appendTable() {
            $('#mainList')
                .append(`<div id="tier1"></div>`)
                .append(`<div id="tier2"></div>`);

            sorted_moudle_keys = (Object.keys(modules)).sort();
            // Construct application card and add to correct list
            for (index in sorted_moudle_keys) {
                app_name = sorted_moudle_keys[index];
                if (modules[app_name].support) {
                    $('#tier1').append(_create_list_element(app_name).addClass('tier1'));
                } else {
                    $('#tier2').append(_create_list_element(app_name).addClass('tier2'));
                }
            }
            function _create_list_element(app_name) {
                let list_element = $('<li></li>')
                    // Adds general classes
                    .addClass('list-group-item-action list-group-item list-group-item-application')
                    // Adds classes dependant on domain
                    .addClass(() => {
                        let out = '';
                        modules[app_name].domains.forEach(function(domain) {
                            out += (` list-group-item-application-${domain} `);
                        });
                        return out;
                    })
                    // Adds classes dependant on machine
                    .addClass(() => {
                        let out = '';
                        for (machine in modules[app_name].machines) {
                            out += (`list-group-item-application-${machine} `);
                        }
                        return out;
                    })
                    // Adds visible list item
                    .append(() => {
                        return $(`<div class='card-clickable' data-toggle='collapse' data-parent='#mainList' data-target='#collapse-${app_name}' </div>`)
                            // Adds header (app name)
                            .append(`<h5 class="app-list-header">${app_name}</h5>`)
                            // Adds domain badges
                            .append(() => {
                                domain_badges = '';
                                modules[app_name].domains.forEach(function(domain) {
                                    //THis builds an array of terms to recognise in the search.
                                    if (canon_domains.findIndex(x => x==domain) == -1){
                                        canon_domains.push(domain);
                                    }
                                    domain_spaces=domain.replace('_', ' ')
                                    domain_badges += `<span onclick=addDomainFilter("${domain}") class="badge-largeinator"><span class="badge badge-domain badge-domain-${domain}">${domain_spaces}</span></span>`;
                                });
                                return domain_badges;
                            })
                            // Adds mahuika badge
                            .append(() => {
                                if (modules[app_name].machines.hasOwnProperty('mahuika')) {
                                    return `<span onclick=addClusterFilter("mahuika","Mahuika") style="float:right;" title="This software is available on Mahuika and the Māui Ancillary node." data-toggle="tooltip" class="badge-largeinator"><span class="badge badge-cluster badge-cluster-mahuika">Mahuika</span></span>`;
                                }
                            })
                            // Adds maui badge
                            .append(() => {
                                if (modules[app_name].machines.hasOwnProperty('maui')) {
                                    return `<span onclick=addClusterFilter("maui","Māui") style="float:right;" title="This software is available on Māui." data-toggle="tooltip" class="badge-largeinator"><span class="badge badge-cluster badge-cluster-maui">Māui</span></span>`;
                                }
                            })
                            // Adds maui_ancil badge
                            .append(() => {
                                if (modules[app_name].machines.hasOwnProperty('maui_ancil')) {
                                    return `<span onclick=addClusterFilter("maui_ancil","Māui&nbsp;Ancil") style="float:right;" title="This software has versions optimised for the Māui Ancillary node." data-toggle="tooltip" class="badge-largeinator"><span class="badge badge-cluster badge-cluster-maui_ancil">Māui Ancil</span></span>`;
                                }
                            })
                            // Adds licence warning triangle
                            .append(() => {
                                if (modules[app_name].licence_type === 'proprietary') {
                                    return `<span class="warning badge badge-licence badge-licence-proprietary" title="Proprietary software. Restrictions may apply." data-toggle="tooltip"> </span>`;
                                }
                            });
                    })
                    // Adds collapsable card segment
                    .append(() => {
                        return $(`<div id="collapse-${app_name}" class="collapse"></div>`)
                            .append(() => {
                                return $(`<div class="card-body card-app"></div>`)
                                    .append(`<p class="cardbody cardbody-description">${modules[app_name].description.split('- Homepage')[0]}</p>`)
                                    // Info
                                    .append(() => {
                                        return $(`<div class="cardbody cardbody-info"></div>`)
                                            .append(() => {
                                                return $(`<table class="version-table"><tbody></tbody></table>`)
                                                    .append(`<tr class="version-table-row"><th>Platform</th><th>Versions</th></tr>`)
                                                    .append(() => {
                                                        out = '';
                                                        for (machine in modules[app_name].machines) {
                                                            out += `<tr><td>${machine.charAt(0).toUpperCase() + machine.slice(1)}</td><td class="font-weight-normal">`;
                                                            modules[app_name].machines[machine].forEach(function(version) {
                                                                out += (`<span class="badger badger-version">${version.split('/')[1]}</span><br>`);
                                                            });
                                                            out = out.slice(0, -4);
                                                            out += (`</tr>`);
                                                        }
                                                        return out;
                                                    });
                                            })
                                            .append(() => {
                                                return $(`<div><span class="bold">Links</span><ul class="docLinks-list">`)
                                                    .append(() => {
                                                        if (modules[app_name].homepage.length > 4) {
                                                            return `<li class="support"><a href="${modules[app_name].homepage}">${app_name} Homepage</a></li>`;
                                                        }
                                                    })
                                                    .append(() => {
                                                        if (modules[app_name].support.length > 4) {
                                                            return `<li class="support"><a href="${modules[app_name].support}">NeSI Documentation</a></li>`;
                                                        }
                                                    });
                                            });
                                    })
                                    // Licences
                                    .append(() => {
                                        if(!(modules[app_name].licence_conditions) && !(Object.keys(modules[app_name].licences).length > 0) && !(modules[app_name].licence_type === 'proprietary')){return} 
                                        return $(`<span"><span class="warning badge badge-licence badge-licence-proprietary" style="margin-left: -2em;float: left;"> </span><span class=bold>Licence</span></span>`)
                                        //Manually included conditions, or defualt propietory paragraph.
                                        .append(() => {
                                            if (modules[app_name].licence_conditions){
                                                return `<p class="">${modules[app_name].licence_conditions}</p>`;
                                            }else if (modules[app_name].licence_type === 'proprietary') {
                                                return `<p class="">${app_name} is proprietary software.</p>`;
                                            }
                                        })
                                        .append(() => {
                                            if (Object.keys(modules[app_name].licences).length > 0) { //
                                                return `<p class="">Access to a valid licence token is required to run ${app_name}, a list of which can be found <a href="${modules[app_name].support}#licences">here</a>.</p>`;
                                            }
                                        });
                                    });
                            });
                    });
                return list_element;
            }
        }
    });
});

function getSearch() { // Check if search string speified in URL

    const searchString = window.location.search.substr(1); // Get from window

    if (searchString.length > 0) { // if valid
        $('#srchbar')[0].value = searchString; // add to searchbar
        srchFunc(); // Call func
    }
}


/* <button type="button" class="close" data-dismiss="alert" aria-label="Close">
<span aria-hidden="true">&times;</span>
</button> */
//<span class="badge badge-domain badge-domain-${domain}">${domain_spaces}</span>`
function addDomainFilter(domain){
    if($(`#srchbar-badge-party-domains > .badge-domain-${domain}`).length < 1){
        $('#srchbar-badge-party-domains').append(() => {
            return `<span class="badge badge-closeable badge-domain badge-domain-${domain}">${domain.replace('_', ' ')}<button type="button" onclick="removeFilter(this)" data-dismiss="alert" aria-label="Close"></button></span>`;
        })
    }else{
        $(`#srchbar-badge-party-domains > .badge-domain-${domain}`).remove()
    }

    filterSearch();
}
function addClusterFilter(cluster, formatname){
    if($(`#srchbar-badge-party-clusters > .badge-cluster-${cluster}`).length < 1){
        $('#srchbar-badge-party-clusters').append(() => {
            return `<span class="badge badge-closeable badge-cluster badge-cluster-${cluster}">${formatname}<button type="button" onclick="removeFilter(this)" data-dismiss="alert" aria-label="Close"></button></span>`;
        })
    }else{
        $(`#srchbar-badge-party-clusters > .badge-cluster-${cluster}`).remove()
    }
    filterSearch();
}
//Removes badge from srcbar and re-filter
function removeFilter(self){
    $(self).parent().remove();
    filterSearch();

}

function srchFunc(event) { 
    // Function called whenever search field edited.
    //Consider replacing with Fuse, if fuzzy or faster search needed.

    // Check if search string matches canon domain.
    string_normal=$('#srchbar')[0].value.toLowerCase()
    if (event == undefined || event.key == " " || event.key == "Enter"){
        canon_domains.forEach((domain) => {
            match_pos=string_normal.search(domain.replace('_', ' '));
            if (match_pos != -1){      
                $('#srchbar')[0].value=string_normal.replace(domain,'');
                addDomainFilter(domain)
            }          
        })  
    }
    filterSearch()
    


    //Hide members.
}

//Goes through each app and shows/hides accordingly.
function filterSearch(){
    //Make array of cannonical domain filters
    domain_array=[];
    cluster_array=[];
    $($(`#srchbar-badge-party-domains`)[0].children).each(function(){
        domain_array.push($(this).attr('class').split(' ').slice(-1)[0].split('-')[2].replace(' ','_'))
    })
    $($(`#srchbar-badge-party-clusters`)[0].children).each(function(){
        cluster_array.push($(this).attr('class').split(' ').slice(-1)[0].split('-')[2].replace(' ','_'))
    })

    function matchClasses(element, inarray){
        //Only doing this as extreme DRY
        if (inarray.length < 1){
            return true
        }
        for (i = 0; i < inarray.length; i++) {
            if (element.hasClass(`list-group-item-application-${inarray[i]}`)){
                return true
            }
        }
        return false
    }


    //domain=this.attr('class')[0].substr() //domain-engineering
    string_normal=$('#srchbar')[0].value.toLowerCase()
    $('.list-group-item-application').each(function() { // Get list members.
        element=$(this)
        comptxt = element.text(); // Flatten content
        $(element).removeClass('hide_search'); //Show all element    
        //console.log([matchClasses(element,"domain", domain_array),matchClasses(element,"cluster", cluster_array),comptxt.toLowerCase().indexOf(string_normal) > -1])
        // If element matches all contitions, leave visible and skip to next element
        //console.log([matchClasses(element, domain_array), matchClasses(element, cluster_array), (comptxt.toLowerCase().indexOf(string_normal) > -1)]);
        if(matchClasses(element, domain_array) && matchClasses(element, cluster_array) && (comptxt.toLowerCase().indexOf(string_normal) > -1)){
            return true
        }
        element.addClass('hide_search'); //Hides element
 
        // if($(`#srchbar-badge-party-domains`).children().length > 1){
        //     //if this domain is selected.
        //     if($(`#srchbar-badge-party-domains > .badge-domain-${domain}`).length > 1){
        //         return true;
        //     }
        // }else{
        //     return true;
        // }
    
    });
    //Stop propigation of clicks to their parent elements.
    $( ".badge-largeinator" ).click(function( event ) {
        event.stopPropagation();
    });
}


function toggleCluster() { // Called by cluster toggle buttons.
    setTimeout(function() { // Must fire after button state changed. Token timeout.
        $('.list-group-item-application').addClass('hide_cluster'); // Hide all
        if ($('.btn-cluster-mahuika').hasClass('active')) { // Is button active.
            $('.list-group-item-application-mahuika').removeClass('hide_cluster');
        }
        if ($('.btn-cluster-maui').hasClass('active')) {
            $('.list-group-item-application-maui').removeClass('hide_cluster');
        }
    }, 1);
}

