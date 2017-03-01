$.fn.extend({
    byviewer: function (option) {

        $(this).each(function (index, ele) {

            var defaultOption = {
                hookbtn: "" //激活按钮
            };

            option = $.extend(defaultOption, option);

            //创建弹出层；
            var $win = $('<div class="byviewer" ><div class="byviewer-mask"></div> <div class="byviewer-imgbox">  </div> <div class="byviewer-close"><span class="fa fa-times "></span></div> <div class="byviewer-prev"><span class="fa fa-chevron-left"></span></div> <div class="byviewer-next"><span class="fa fa-chevron-right"></span></div><div class="byviewer-info"></div> <div class="byviewer-toolbar"> <div class="byviewer-addrotate"><span class="fa fa-rotate-right"></span></div> <div class="byviewer-reducerotate"><span class="fa fa-rotate-left"></span></div> <div class="byviewer-addscale"><span class="fa fa-search-plus"></span></span></div> <div class="byviewer-reducescale"><span class="fa fa-search-minus"></span></div> <div class="byviewer-reset"><span class="fa fa-refresh"></span></div> </div> </div> ');

            //复制图片到弹出窗口并添加到body当中
            $win.find(".byviewer-imgbox").append($(ele).find("img").clone());

            //添加弹出层
            $("body").append($win);

            var $imgArry = $win.find("img");
            var infoArry = [];
            $imgArry.each(function (a, b) {
                var info = $(b).data("info");
                if (info) {
                    infoArry.push(info);
                }
            });


            var imgSize = $imgArry.size();
            var curIndex = 0;

            var winWidth, winHeight, winScale;


            function resizeImg($obj, opposite) {
                winWidth = $(window).width();
                winHeight = $(window).height();

                winScale = winWidth / winHeight;
                $obj.each(function (imgindex, imgele) {
                    var imgWidth = $(imgele).attr("data-prewidth") || $(imgele).width();
                    var imgHeight = $(imgele).attr("data-preheight") || $(imgele).height();



                    $(imgele).attr("data-prewidth", imgWidth);
                    $(imgele).attr("data-preheight", imgHeight);

                    $(imgele).css({
                        top: "50%",
                        left: "50%"
                    }); //图片旋转需要

                    var imgScale;
                    //图片水平时
                    if (!opposite) {
                        imgScale = imgWidth / imgHeight;
                        if (imgWidth > winWidth || imgHeight > winHeight) {
                            if (imgScale > winScale) {
                                $(imgele).width(winWidth);
                                $(imgele).css({
                                    "height": "",
                                    "marginLeft": winWidth / (-2) + "px",
                                    "marginTop": $(imgele).height() / -2 + "px"

                                });
                            } else if (imgScale < winScale) {
                                $(imgele).height(winHeight);
                                $(imgele).css({
                                    "width": "",
                                    "marginLeft": $(imgele).width() / -2 + "px",
                                    "marginTop": winHeight / -2 + "px"
                                });
                            }
                        }
                    }
                    //图片非水平
                    else {

                        imgScale = imgHeight / imgWidth;
                        if (imgWidth > winHeight || imgHeight > winWidth) {
                            if (imgScale > winScale) {

                                $(imgele).height(winWidth);
                                $(imgele).css("width", "");


                            } else if (imgScale < winScale) {
                                $(imgele).width(winHeight);
                                $(imgele).css("height", "");
                            }
                        }

                    }

                    //居中设置
                    $(imgele).css({
                        "top": winHeight/2+"px",
                        "left": winWidth/2+"px",
                        "marginLeft": $(imgele).width() / -2 + "px",
                        "marginTop": $(imgele).height() / -2 + "px"
                    });

                });
            }

            function rotateImg($obj, direction) {
                var rotate;
                if (!$obj.attr("data-rotate")) {
                    rotate = 0;
                } else {
                    rotate = parseInt($obj.attr("data-rotate"));
                }
                rotate += 90 * direction;
                //  rotate=rotate%360;
                $obj.css("transform", "rotate(" + rotate + "deg)");
                $obj.attr("data-rotate", rotate);

                if (rotate % 180 === 0) {
                    resizeImg($obj, false);
                } else {
                    resizeImg($obj, true);
                }
            }

            function zoomImg($obj, direction) {
                var zoom;
                if (!$obj.attr("data-zoom")) {
                    zoom = 1;
                } else {
                    zoom = parseFloat($obj.attr("data-zoom"));
                }
                if (direction === 1) {
                    zoom *= 1.5;
                } else {
                    zoom /= 1.5;
                }

                var rotate = $obj.attr("data-rotate") || 0;

                $obj.css("transform", "scale(" + zoom + ") rotate(" + rotate + "deg)");
                $obj.attr("data-zoom", zoom);
            }

            function setInfo(index) {
                var html = "";
                if (index < infoArry.length) {
                    var obj = infoArry[index];
                    for (var i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            html += '<p>' + i + ':' + obj[i] + '</p>';
                        }
                    }

                }



                $win.find(".byviewer-info").html(html);


            }

            //旋转
            $win.find(".byviewer-addrotate,.byviewer-reducerotate").click(function () {

                var direction = 1;
                if ($(this).hasClass("byviewer-reducerotate")) {
                    direction = -1;
                }
                var cur = $imgArry.eq(curIndex);
                rotateImg(cur, direction);
            });

            //缩放
            $win.find(".byviewer-addscale,.byviewer-reducescale").click(function () {

                var direction = 1;
                if ($(this).hasClass("byviewer-reducescale")) {
                    direction = -1;
                }
                var cur = $imgArry.eq(curIndex);
                zoomImg(cur, direction);
                
            });

            //拖动-----待完善
            var startDrag = false;
            var startX, startY;
            var $dragobj;
            $imgArry.mousedown(function (e) {
                startDrag = true;
                $dragobj = $(this).css("cursor", "move");
                startX = e.pageX;
                startY = e.pageY;

            }).mousemove(function (e) {
                if (startDrag) {
                    var diffX = e.pageX - startX;
                    var diffY = e.pageY - startY;
                    // console.log("diffx:"+diffX+" diffy"+diffY);
                    // console.log($dragobj.position());

                    $dragobj.css({
                        top: parseFloat($dragobj.css("top")) + diffY + "px",
                        left: parseFloat($dragobj.css("left")) + diffX + "px",

                    });
                    startX = e.pageX;
                    startY = e.pageY;
                }
                return false;


            }).on("mouseup mouseleave", function () {
                // console.log("cancelDrag")
                startDrag = false;
                $dragobj && $dragobj.css("cursor", "auto");
            });

            //重置变换
            $win.find(".byviewer-reset").click(function () {

                $imgArry.css("transform", "");
                $imgArry.removeAttr("data-rotate");
                $imgArry.removeAttr("data-zoom");
                resizeImg($imgArry, false);
            });

            //切换
            $win.find(".byviewer-prev,.byviewer-next").click(function () {
                var direction = $(this).hasClass("byviewer-prev") ? -1 : 1;
                curIndex = curIndex + direction;
                curIndex = curIndex < 0 ? imgSize - 1 : curIndex;
                curIndex = curIndex === imgSize ? 0 : curIndex;
                $imgArry.eq(curIndex).show().siblings().hide();
                setInfo(curIndex);

            });

            //图片激活
            $(ele).find("li").click(function () {
                curIndex = $(this).index();
                $imgArry.eq(curIndex).show().siblings().hide();
                setInfo(curIndex);
                $win.show();
                resizeImg($imgArry, false);
            });

            //按钮激活
            if (option.hookbtn) {
                $(option.hookbtn).click(function () {
                    $(ele).find("li").eq(0).click();
                });

            }

            //关闭
            $win.find(".byviewer-close").click(function () {
                $win.hide();
            });
        });
    },

});