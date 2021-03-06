/* global CloudCmd */
/* global CloudFunc */
/* global DOM */

'use strict';

module.exports = uploadDirectory;

function uploadDirectory(items) {
    const Images = DOM.Images;
    const Info = DOM.CurrentInfo;
    const load = DOM.load;
    const Dialog = DOM.Dialog;
    
    let array   = [
        'findit',
        'philip'
    ];
    
    if (items.length)
        Images.show('top');
    
    const entries = [].map.call(items, (item) => {
        return item.webkitGetAsEntry();
    });
    
    array = array.map((name) => {
        const result = [
            '/modules/' + name,
            '/lib/' + name,
            '.js'
        ].join('');
        
        return result;
    });
    
    const url = CloudCmd.join(array);
    
    load.js(url, () => {
        const path = Info.dirPath
            .replace(/\/$/, '');
        
        const uploader = window.philip(entries, (type, name, data, i, n, callback) => {
            const prefixURL = CloudCmd.PREFIX_URL;
            const FS = CloudFunc.FS;
            const full = prefixURL + FS + path + name;
            
            let upload;
            switch(type) {
            case 'file':
                upload = uploadFile(full, data);
                break;
            
            case 'directory':
                upload = uploadDir(full);
                break;
            }
            
            upload.on('end', callback);
            
            upload.on('progress', (count) => {
                const current = percent(i, n);
                const next = percent(i + 1, n);
                const max = next - current;
                const value = current + percent(count, 100, max);
                
                setProgress(value);
            });
        });
        
        uploader.on('error', (error) => {
            Dialog.alert(error);
            uploader.abort();
        });
        
        uploader.on('progress', setProgress);
        
        uploader.on('end', () => {
            CloudCmd.refresh();
        });
    });
}

function percent(i, n, per) {
    if (typeof per === 'undefined')
        per = 100;
    
    return Math.round(i * per / n);
}

function setProgress(count) {
    DOM.Images
        .setProgress(count)
        .show('top');
}

function uploadFile(url, data) {
    return DOM.load.put(url, data);
}

function uploadDir(url) {
    return DOM.load.put(url + '?dir');
}

