// アタック25ができるオセロJavaScript
// 初期変数定義
var times = 0;
var size = 5; // 表の大きさ
var player = 2; // プレイヤー数
var turn = 0; // ターン 1:赤、2:緑、3:白、4:青
color_list = ["#bbb", "#f00", "#0a0", "#fff", "#55f"];
color_name = ["色を選択してください", "赤", "緑", "白", "青"];
var save_data = []; // 盤面保存配列
save_data[0] = [];
// 盤面の状態を二次元配列で格納
var data = new Array(size)
save_data[0][0] = new Array(size);
for (var x = 0; x < data.length; x++){
    data[x] = new Array(size).fill(0); //初期値はどこにも置いていない
    save_data[x] = new Array(size).fill(0);
}
//おけるパネル番号の配列
var priority = [13];
//取得済みパネル番号の配列
var got_num = [];
//アタックチャンス用変数
var chance = -1; //-1:未発動/済 0: 発動中
save_data[0][1] = -1;

//8方向の移動ベクトル
var dx = [1,1,0,-1,-1,-1,0,1];
var dy = [0,1,1,1,0,-1,-1,-1];

// 初期化関数
function init(){
    save_data = []; // 盤面保存配列
    save_data[0] = [];
    // 盤面の状態を二次元配列で格納
    data = new Array(size)
    save_data[0][0] = new Array(size);
    for (var x = 0; x < data.length; x++){
        data[x] = new Array(size).fill(0); //初期値はどこにも置いていない
        save_data[x] = new Array(size).fill(0);
    }
    save_data[0][1] = -1;
    priority = [13];
    got_num = [];
    chance = -1;
    times = 0;
    document.getElementById("time").innerText = 'リセット';
    change_none();
}

// 元に戻す関数
function undo(){
    if (times <= 1){
        alert('最初の状態に戻しました。\nアクティブな色を選択してください。');
        init(); return;
    }
    times = times - 1;
    // 盤面の状態を二次元配列で格納
    for (var x = 0; x < data.length; x++){
        for (var y = 0; y < data.length; y++){
            data[x][y] = save_data[times][0][x][y];
        }
    }
    chance = save_data[times][1];
    save_data.pop();
    got_num.pop();
    document.getElementById("time").innerText = times+'面';
    alert('1つ前の状態に戻しました。\nアクティブな色を選択してください。');
    change_none();
}

// ターンの色変更
function change_color(column){
    turn = column + 1;
    priority = check();
    console.log('priority=['+priority+']')
}

// 背景色/セル内容設定
function backcolor(cell_data, cell, i, j){
    cell.innerText = i*5 + j + 1; //セル内容更新
    if(cell_data == 0){ //まだ誰も取ってない時は背景色を暗くする
        cell.style.backgroundColor = "#bbb";
    }else{
        cell.style.backgroundColor = color_list[cell_data];
    }
}

// 表の動的作成
function makeTable(data, tableId){
    turn = 0;
    // 表の作成開始
    var rows = [];
    var color_count = [0, 0, 0, 0, 0];
    var table = document.getElementById(tableId);
    while( table.rows[ 0 ] ) table.deleteRow( 0 ); //一度表をすべて削除

    // 表に2次元配列の要素を格納
    for(i = 0; i < data.length; i++){
        rows.push(table.insertRow(-1));  // 行の追加
        for(j = 0; j < data[0].length; j++){
            cell = rows[i].insertCell(-1);
            backcolor(data[i][j], cell, i, j); //背景色の設定
            color_count[data[i][j]] += 1;
        }
    }

    // 色カウント表を作成
    var rows_c = [];
    var table2 = document.getElementById("color");
    while( table2.rows[ 0 ] ) table2.deleteRow( 0 ); //一度表をすべて削除
    for(i = 1; i < color_list.length; i++){
        if(i % 5 == 1){rows_c.push(table2.insertRow(-1));}  // 行の追加
        cell2 = rows_c[Math.floor((i-1)/5)].insertCell(-1);
        cell2.innerText = color_count[i];
        cell2.style.backgroundColor = color_list[i]
        console.log(cell2)
    }
}

// 表の動的更新
function refreshTable(tableId){
    // 表のセット
    var table = document.getElementById(tableId);
    var color_count = [0, 0, 0, 0, 0];

    // 表に2次元配列の要素を更新
    for(i = 0; i < data.length; i++){
        for(j = 0; j < data[0].length; j++){
            cell = table.rows[i].cells[j]
            backcolor(data[i][j], cell, i, j); //背景色の設定
            if(priority.indexOf(i*5+j+1) >= 0 || i*5+j+1 == chance){
                if(chance != 0){cell.style.color = color_list[turn];}
                if(i*5+j+1 == chance){cell.style.backgroundColor = "#ff0";}
            }else{
                cell.style.color = '#000'
            }
            color_count[data[i][j]] += 1;
        }
    }
    // 色カウント表を作成
    var table2 = document.getElementById("color");
    for(i = 1; i < color_list.length; i++){
        cell2 = table2.rows[Math.floor((i-1)/5)].cells[(i-1)%5];
        cell2.innerText = color_count[i];
    }
    if(chance == -1 && color_count[0] == 5){
        chance = -2;
        return '次はアタックチャンス！';
    }
    else if(chance == 0){return 'アタックチャンス！';}
    else if(chance > 0){return color_name[turn];}
    else if(color_count[0] == 0){
        var top = 0;
        var top_color = "";
        for(n=1; n<color_list.length; n++){
            if(color_count[n] > top){
                top = color_count[n];
                top_color = color_name[n];
            }else if(color_count[n] == top){
                top_color = top_color + '・' + color_name[n];
            }
        }
        return '優勝：'+top_color+'（'+top+'枚）';
    }
    return color_name[turn];
}

// サジェスト機能
function check(){ //プレーヤーごとにループ
    if(turn == 0){return [];}
    var priority1 = [];
    var priority2 = [];
    var priority3 = [];

    for(j=0; j<25; j++){ //各マスをループ
        if(data[Math.ceil((j+1)/5)-1][j%5] != 0){continue;} //すでに埋まってる
        //8方向すべて空白なら、スキップ
        var around_flag = false;
        for(k=0; k<8; k++){
            if(Math.ceil((j+1)/5)-1+dx[k] < 0 || j%5+dy[k] < 0){continue;}
            if(Math.ceil((j+1)/5)-1+dx[k] >= 5 || j%5+dy[k] >= 5){continue;}
            if(data[Math.ceil((j+1)/5)-1+dx[k]][j%5+dy[k]] != 0){
                around_flag = true;
            }
        }
        if(!around_flag){continue;}
        //8方向を調べ、最も優先順位の高い方向を選択
        prim = 4; //優先順位
        for(k=0; k<8; k++){
            if(Math.ceil((j+1)/5)-1+dx[k] < 0 || j%5+dy[k] < 0){continue;}
            if(Math.ceil((j+1)/5)-1+dx[k] >= 5 || j%5+dy[k] >= 5){continue;}
            if(data[Math.ceil((j+1)/5)-1+dx[k]][j%5+dy[k]]){
                var rank = search(turn, k, Math.ceil((j+1)/5)-1, j%5, 0);
                prim = Math.min(prim, rank);
            }
        }
        //優先順位ごとの配列にパネル番号追加
        if(prim == 1){priority1.push(j+1);}
        else if(prim == 2){priority2.push(j+1);}
        else if(prim == 3){priority3.push(j+1);}
        else{priority1.push(j+1);}
    }
    //最も優先順位が高いものを返す
    if(priority1.length > 0){return priority1;}
    else if(priority2.length > 0){return priority2;}
    else if(priority3.length > 0){return priority3;}
    else if(got_num.length > 25){return [];}
    else{return [13];} //1枚もパネルがないとき
}

// 各色についてkで指定した方向にパネルか挟めるか判定し優先順位を返す関数
function search(color, k, xx, yy, count){
    var xx = xx + dx[k]; var yy = yy + dy[k];
    if(count == 0 && data[xx][yy] == 0){return 4;} //隣のパネル＝空白=>不可
    else if(count == 0 && !data[xx][yy]){return 4;} //端=>不可
    else if(count == 0 && data[xx][yy] == color){return 3;} //隣のパネル＝自分=>3
    else if(xx < 0 || yy < 0 || xx >= size || yy >= size){return 3;} //端になり次挟めない=>3
    else if(data[xx][yy] == 0){return 2;} //次挟める=>2
    else if(data[xx][yy] == color){return 1;} //挟める=>1
    else{return search(color, k, xx, yy, count+1);}
}

// 各色についてkで指定した方向にパネルをひっくり返す関数
function line_reverse(color, k, xx, yy){
    var xx = xx + dx[k]; var yy = yy + dy[k];
    console.log(xx+'×'+yy+'('+dx[k]+','+dy[k]+')')
    if(xx < 0 || yy < 0 || xx >= size || yy >= size){return 3;}
    else if(!data[xx][yy]){return 3;} //次挟めない=>3
    else if(data[xx][yy] == 0){return 2;} //次挟める=>2
    else if(data[xx][yy] == color){return 1;} //挟める=>1
    else{
        data[xx][yy] = color;
        return line_reverse(color, k, xx, yy);
    }
}

// 指定したセルからひっくり返す
function reverse (row,column){
    if(chance == 0){
        if(got_num.indexOf(row*5+column+1) >= 0){
            data[row][column] = 0;
            chance = row*5+column+1;
            priority = check();
            times += 1;
            return;
        }
        alert('アタックチャンスの番号を選んでください。');
    }
    else if(priority.indexOf(row*5+column+1) >= 0 || row*5+column+1 == chance){
        //8方向をひっくり返す
        data[row][column] = turn;
        for(k=0; k<8; k++){
            if((row+dx[k]) < 0 || (column+dy[k]) < 0){continue;}
            if((row+dx[k]) >= 5 || (column+dy[k]) >= 5){continue;}
            if(data[row+dx[k]][column+dy[k]] != 0){
                if(search(turn, k, row, column, 0) == 1){
                    res = line_reverse(turn, k, row, column);
                    console.log("コード"+res)
                }
            }
        }
        if(row*5+column+1 == chance){chance = -1;} //アタックチャンスのマスならチャンス終了
        else if(chance == -2){
            chance = 0;
            priority = [];
        }
        else if(chance == row*5+column+1){
            chance = -1;
        }
        got_num.push(row*5+column+1);
        priority = check();
        times += 1;
        save_data[times] = new Array(2);
        save_data[times][0] = [];
        for(i=0; i<data.length; i++){
            save_data[times][0][i] = [];
            for(j=0; j<data[i].length; j++){
                save_data[times][0][i][j] = data[i][j];
            }
        }
        save_data[times][1] = chance;
        console.log(save_data[times][0][2][2])
        console.log(times)
    }
}

// 初回読み込み時
window.onload = function(){ 
    // 表の動的作成
    makeTable(data,"field");
};

function change_none(){
    change_color(-1);
    res = refreshTable("field");
    document.getElementById("input").value = res;
}

// ここからJQuery関数
$(function(){
    // ID fieldのセルをクリックした場合に実行する関数
    $('#field td').on('click', function() {
        var td_row = $(this).closest('tr').index(); //行
        var td_col = this.cellIndex; //列
        if(turn == 0){alert('現在の色を選択してください。'); return;}
        if (data[td_row][td_col] == 0 || (chance == 0 && data[td_row][td_col] != 0)) {
            reverse(td_row, td_col)
            res = refreshTable("field");
            if(res != ''){$("#input").val(res);}
            document.getElementById("time").innerText = times+'面';
        }
    });
    // ID colorのセルをクリックした場合に実行する関数
    $('#color td').on('click', function() {
        var td_row = $(this).closest('tr').index(); //行
        var td_col = this.cellIndex; //列
        $("#input").val(color_name[td_row*5+td_col+1]);
        change_color(td_row*5+td_col);
        refreshTable("field");
    });
});