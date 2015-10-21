module.exports = function( ret, conf, settings, opt ) {
    // foreach res/pkg add cdn properties
    // for which has a cdn properties
    var map = ret.map;

    var src = ret.src;
    var res = map.res;

    var pkg  = ret.pkg;
    var mpkg = map.pkg;

    var getPackMap = function (ret, conf, settings, opt) {
        var uriToIdMap = {};
        var fileToPack = {};
        var packToFile = {};
        fis.util.map(ret.map.pkg, function (id, pkg) {
            uriToIdMap[pkg.uri] = id;
        });
        fis.util.map(ret.pkg, function (subpath, file) {
            var uri = file.getUrl(opt.hash, opt.domain);
            var id = uriToIdMap[uri];
            if (id) {
                //没有ID的PKG文件无需建立MAP
                packToFile[id] = file;
                fileToPack[file.getId()] = {
                    id: id,
                    pkg: ret.map.pkg[id]
                };
            }
        });
        return {
            packToFile: packToFile,
            fileToPack: fileToPack
        };
    }

    var pack_map = getPackMap.apply(null, [].slice.call(arguments));

    function absolutePathToRelativePath ( file ) {
        var content = file.getContent();
        file.setContent(content);
    }

    fis.util.map( src, function( subpath, file ) {
        if( file.useMap ){
            var map_node = res[file.getId()];
            if( 'useCdn' in file ){
                map_node.useCdn = file.useCdn ? 1 : 0;

                if( file.useCdn && file.type == 'css'){
                    absolutePathToRelativePath(file);
                }
            }
        }
    });

    fis.util.map( pkg, function( subpath, pkg ) {
        if( 'useCdn' in pkg ) {
            var pkg_recode = mpkg[pack_map.fileToPack[pkg.getId()].id];
            pkg_recode.useCdn = pkg.useCdn ? 1 : 0;
            if( pkg.useCdn && pkg.type == 'css'){
                absolutePathToRelativePath(pkg);
            }
        }
    });
}