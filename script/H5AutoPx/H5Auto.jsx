function H5Auto() {
  app.preferences.rulerUnits = Units.PIXELS;
  var doc = app.activeDocument;
  var docPath = doc.path;
  var docName = doc.name.split(".")[0];
  var scriptPath = new File($.fileName).parent;
  var templatePath = scriptPath + "/template/";
  var outputPath = new Folder(docPath + "/" + docName + "/");
  if (outputPath.exists) {
    if (!confirm("输出目录已存在是否覆盖？", "提示")) {
      return false;
    }
  }
  var template = new Folder(templatePath);
  copyFiles(template, outputPath, '');

  var mergeLayer = false;
  if (confirm("是否需要自动处理图层？（如果您已经手动对所有非文字图层栅格化图层样式请选择取消/否）", "提示")) {
    mergeLayer = true;
  }

  var textLayerFailTips = false;

  function textFail() {
    if (!textLayerFailTips) {
      textLayerFailTips = true;
      alert("您当前版本的PS无法处理部分文字样式，文字内容已正常输出到页面，请检查");
    }
  }

  //script.js模版处理
  var scriptFile = new File(outputPath + "/js/script.js");
  var scriptRead = "";
  scriptFile.open("r");
  scriptFile.encoding = 'utf-8';
  scriptRead = scriptFile.read();
  scriptFile.close();
  var scriptDWidth = doc.width.as('px');
  var scriptDHeight = doc.height.as('px');
  scriptRead = scriptRead.replace(/{{dWidth}}/g, scriptDWidth.toString());
  scriptRead = scriptRead.replace(/{{dHeight}}/g, scriptDHeight.toString());
  scriptFile.open("w");
  scriptFile.encoding = 'utf-8';
  scriptFile.write(scriptRead);
  scriptFile.close();

  //index.html模版处理
  var indexPageTemplate = '<div class="page {{indexPageNo}}" id="{{indexPageNo}}">\n<div class="page_box">\n{{indexPageMain}}</div>\n</div>';
  var indexImgTemplate = '<img class="{{indexImgClass}}" src="img/{{indexImgName}}.png" />\n';
  var indexTextTemplate = '<div class="{{indexTextClass}}"><p>{{indexTextContents}}</p></div>';
  var pageMainContent = "";
  var pageLength = doc.layerSets.length;
  var pageIndex = 0;

  //style.css模版处理
  var styleEleBlock = '.{{styleEleName}} {position: absolute;width: {{styleEleWidth}};height: auto;left: {{styleEleLeft}};top: {{styleEleTop}};}';
  var styleTextBlock = '.{{styleTextName}} {position: absolute;width: {{styleTextWidth}};height: {{styleTextHeight}};left: {{styleTextLeft}};top: {{styleTextTop}};line-height: {{styleTextLineheight}};font-size: {{styleTextFontsize}};text-indent: {{styleTextTextIndent}};color: {{styleTextColor}};}';
  var styleContentMain = "";
  var stylePageBg = "";
  var pageWithBg = '.{{indexPageNo}} {background-image: url(../img/{{pageBg}}.jpg);}';

  //图层遍历
  getLayers(doc.layers, 0);

  //读写html模版
  var htmlFile = new File(outputPath + "/index.html");
  var htmlRead = "";
  htmlFile.open("r");
  htmlFile.encoding = 'utf-8';
  htmlRead = htmlFile.read();
  htmlFile.close();
  htmlRead = htmlRead.replace(/{{dWidth}}/g, scriptDWidth);
  htmlRead = htmlRead.replace(/{{title}}/g, docName);
  htmlRead = htmlRead.replace(/{{htmlMain}}/g, pageMainContent);
  htmlFile.open("w");
  htmlFile.encoding = 'utf-8';
  htmlFile.write(htmlRead);
  htmlFile.close();

  //读写css模版
  var cssFile = new File(outputPath + "/css/style.css");
  var cssRead = "";
  cssFile.open("r");
  cssFile.encoding = 'utf-8';
  cssRead = cssFile.read();
  cssFile.close();
  cssRead = cssRead.replace(/{{uniBg}}/g, stylePageBg);
  cssRead = cssRead.replace(/{{dWidth}}/g, scriptDWidth);
  cssRead = cssRead.replace(/{{dWidthHalf}}/g, scriptDWidth / 2);
  cssRead = cssRead.replace(/{{cssMain}}/g, styleContentMain);
  cssFile.open("w");
  cssFile.encoding = 'utf-8';
  cssFile.write(cssRead);
  cssFile.close();

  function getLayers(layers) {
    for (var i = layers.length - 1; i >= 0; i--) {
      if (layers[i].typename == "LayerSet") {
        pageIndex += 1;
        buildpage(layers[i].layers, pageIndex, pageLength);
      } else if (layers[i].name == "bg") {
        stylePageBg = 'background-image: url(../img/bg.jpg);';
        saveLayer(layers[i], "bg", "bg");
      }
    }
  }

  function buildpage(artLayers, i, len) {
    var groupHtml = "";
    var layers = [];
    for (var k = 0; k <= artLayers.length - 1; k++) {
      if (!artLayers[k].visible) {
        continue;
      }
      if (artLayers[k].name == "bg") {
        var pageWithBgTemp = pageWithBg.replace(/{{indexPageNo}}/g, "page_" + i);
        pageWithBgTemp = pageWithBgTemp.replace(/{{pageBg}}/g, "bg_" + i);
        styleContentMain += pageWithBgTemp;
        saveLayer(artLayers[k], "bg_" + i, "bg");
        continue;
      }
      layers.push(artLayers[k]);

    }
    groupHtml += buildGroup(layers, "p_" + i);
    var indexPageNo = "page_" + i;
    var indexPageTemp = indexPageTemplate.replace(/{{indexPageNo}}/g, indexPageNo);
    indexPageTemp = indexPageTemp.replace(/{{indexPageMain}}/g, groupHtml);
    pageMainContent += indexPageTemp;
  }

  function buildGroup(layers, parentClass) {
    var groupHtml = "<div class='" + parentClass + "'>\n";
    for (var i = layers.length - 1; i >= 0; i--) {
      if (layers[i].typename == "LayerSet") {
        groupHtml += buildGroup(layers[i].layers, parentClass + "_" + i);
      } else if (layers[i].kind === LayerKind.TEXT) {
        var textItem = layers[i].textItem;
        var textTemp = indexTextTemplate.replace(/{{indexTextClass}}/g, parentClass + "_" + i);
        textTemp = textTemp.replace(/{{indexTextContents}}/g, textItem.contents.replace(/\r/g, "&nbsp;</p><p>"));
        groupHtml += textTemp;
        var styleTextBlockTemp = styleTextBlock.replace(/{{styleTextName}}/g, parentClass + "_" + i);
        styleTextLeft = layers[i].bounds[0].as('px');
        styleTextTop = layers[i].bounds[1].as('px');
        styleTextWidth = layers[i].bounds[2].as('px') - styleTextLeft;
        styleTextHeight = layers[i].bounds[3].as('px') - styleTextTop;
        styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextWidth}}/g, styleTextWidth + "px");
        styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextHeight}}/g, styleTextHeight + "px");
        styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextLeft}}/g, styleTextLeft + "px");
        styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextTop}}/g, styleTextTop + "px");

        try {
          styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextFontsize}}/g, textItem.size.as('px').toFixed(0) + "px");
        } catch (e) {
          styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextFontsize}}/g, "inherit");
          textFail();
        }
        try {
          styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextLineheight}}/g, textItem.leading.as('px').toFixed(0) + "px");
        } catch (e) {
          styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextLineheight}}/g, "inherit");
          textFail();
        }
        try {
          styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextTextIndent}}/g, textItem.firstLineIndent.as('px') + "px");
        } catch (e) {
          styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextTextIndent}}/g, "inherit");
          textFail();
        }
        try {
          styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextColor}}/g, "#" + textItem.color.rgb.hexValue);
        } catch (e) {
          styleTextBlockTemp = styleTextBlockTemp.replace(/{{styleTextColor}}/g, "inherit");
          textFail();
        }
        styleContentMain += styleTextBlockTemp;
      } else {
        var imgTemp = indexImgTemplate.replace(/{{indexImgClass}}/g, parentClass + "_" + i);
        imgTemp = imgTemp.replace(/{{indexImgName}}/g, parentClass + "_" + i);
        groupHtml += imgTemp;
        var styleEleBlockTemp = styleEleBlock.replace(/{{styleEleName}}/g, parentClass + "_" + i);
        styleEleLeft = layers[i].bounds[0].as('px');
        styleEleTop = layers[i].bounds[1].as('px');
        styleEleWidth = layers[i].bounds[2].as('px') - styleEleLeft;
        styleEleBlockTemp = styleEleBlockTemp.replace(/{{styleEleWidth}}/g, styleEleWidth + "px");
        styleEleBlockTemp = styleEleBlockTemp.replace(/{{styleEleLeft}}/g, styleEleLeft + "px");
        styleEleBlockTemp = styleEleBlockTemp.replace(/{{styleEleTop}}/g, styleEleTop + "px");
        styleContentMain += styleEleBlockTemp;
        saveLayer(layers[i], parentClass + "_" + i, "")
      }
    }
    groupHtml += "</div>\n";
    return groupHtml;
  }

  function saveLayer(layer, name, savetype) {
    var bounds = layer.bounds;
    var width;
    var height;
    var tempDoc;
    if (savetype == "bg") {
      layer.copy();
      var width = scriptDWidth;
      var height = scriptDHeight;
      tempDoc = app.documents.add(width, height, 72, "myDocument", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
      app.activeDocument.paste();
      var file = new File(outputPath + "/img/" + name + ".jpg");
      var option = new ExportOptionsSaveForWeb();
      option.format = SaveDocumentType.JPEG;
      app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, option);
    } else {
      doc.activeLayer = layer;
      //layer.rasterize(RasterizeType.ENTIRELAYER);
      if (mergeLayer) {
        var emptyLayer = layer.parent.artLayers.add();
        emptyLayer.move(layer, ElementPlacement.PLACEAFTER);
        layer.merge();
      }
      var width = bounds[2].as('px') - bounds[0].as('px');
      var height = bounds[3].as('px') - bounds[1].as('px');
      var region = [
        [bounds[0].as('px'), bounds[1].as('px')],
        [bounds[2].as('px'), bounds[1].as('px')],
        [bounds[2].as('px'), bounds[3].as('px')],
        [bounds[0].as('px'), bounds[3].as('px')]
      ];
      var type = SelectionType.REPLACE;
      var feather = 0;
      var antiAlias = true;
      doc.selection.select(region, type, feather, antiAlias);
      app.activeDocument.selection.copy();
      tempDoc = app.documents.add(width, height, 72, "myDocument", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
      tempDoc.paste();
      var file = new File(outputPath + "/img/" + name + ".png");
      var option = new ExportOptionsSaveForWeb();
      option.format = SaveDocumentType.PNG;
      option.PNG8 = false;
      tempDoc.exportDocument(file, ExportType.SAVEFORWEB, option);
    }

    tempDoc.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = doc;
  }

  function copyFiles(src, target) {
    var srcDir = new Folder(src);
    var targetDir = new Folder(target);
    if (targetDir.exists) {
      targetDir.remove();
    }
    targetDir.create();
    var files = srcDir.getFiles();
    for (var i = 0; i < files.length; i++) {
      var iFile = files[i];
      if (iFile instanceof Folder) {
        copyFiles(src + '/' + iFile.name, target + '/' + iFile.name);
        continue;
      }
      var oFile = new File(targetDir + '/' + iFile.name);
      if (oFile.exists) {
        oFile.remove();
      }
      iFile.copy(oFile);
    }
  };
}
H5Auto();