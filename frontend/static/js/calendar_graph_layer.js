/**
 * @author Wenqiang Xie
 * @date 09/14/2021
 * @copyright this code is not part of original project.
 */

const calendar_data = {
    '路径长度': {
        '0-7': 0.55,
        '8-15': 0.94,
        '16-17': -0.43,
        '18': 0.74,
        '19': 0.89,
        '20-22': -0.6,
        '23': -0.55,
        'weight': -0.8
    },
    '信号灯数': {
        '0-7': 0.46,
        '8-15': -0.77,
        '16-17': -0.65,
        '18': -0.63,
        '19': -0.51,
        '20-22': -0.89,
        '23': -0.61,
        'weight': -0.6
    },
    '平均速度': {
        '0-7': -0.19,
        '8-15': 0.33,
        '16-17': 0.34,
        '18': 0.39,
        '19': 0.29,
        '20-22': -0.38,
        '23': 0.12,
        'weight': 0.2
    },
    '道路级别': {
        '0-7': 0.72,
        '8-15': 0.48,
        '16-17': 0.62,
        '18': -0.61,
        '19': -0.46,
        '20-22': -0.29,
        '23': 0.55,
        'weight': 0.4
    },
    '时间成本': {
        '0-7': 0.77,
        '8-15': 0.58,
        '16-17': -0.38,
        '18': -0.1,
        '19': -0.19,
        '20-22': 1.05,
        '23': 0.61,
        'weight': -0.9
    }
};

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy"));
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
            let tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${dy}em`).attr('text-anchor', 'middle');
            let str = "";

            for (let ii = 0; ii < word.length; ii++) {
                str = str + word[ii];
                tspan.text(str);
                tspan.attr('x', tspan.node().getComputedTextLength());
                if (tspan.node().getComputedTextLength() > width) {
                    str = str.slice(0, -1);
                    tspan.text(str);
                    tspan.attr('x', tspan.node().getComputedTextLength());
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${dy}em`).attr('text-anchor', 'middle');
                    str = "";
                    ii--;
                }

            }
        }
    })
}

function initialCalendarGraph(selector) {
    const clientWidth = d3.select(selector)[0][0].clientWidth;
    const clientHeight = d3.select(selector)[0][0].clientHeight;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = clientWidth;
    const cellWidth = (width - 200) / 7;
    const fontSize = 14;

    const height = 20 + cellWidth * 6;

    const features = ['路径长度', '信号灯数', '平均速度', '道路级别', '时间成本'];
    const keys = ['0-7', '8-15', '16-17', '18', '19', '20-22', '23'];

    const svg = d3.select(selector).append('svg').attr('width', width).attr('height', height);
    const g = svg.append('g');

    features.map((f, i) => {
        // feature legend
        const textG = g.append('g').attr('transform', `translate(0, ${cellWidth * (i + 1) + fontSize})`)
        textG.append('text')
            .attr('font-size', 14)
            .attr('class', 'calendar-text')
            .text(f)
            .attr("dy", "1em")
            .call(wrap, 30);

        // cell graph
        keys.map((k, j) => {
            // graph group of cell
            const cellG = g.append('g').attr('transform', `translate(${50 + cellWidth * j}, ${cellWidth * (i + 1)})`);

            // rect of background
            cellG.append('rect')
                .attr('width', cellWidth - 20)
                .attr('height', cellWidth - 20)
                .attr('x', 10)
                .attr('y', 5)
                .attr('fill', '#EEEBEB');


            // react in center
            const centerWidth = Math.abs(calendar_data[f][k]) > 1 ? (cellWidth - 20) : (cellWidth - 20) * Math.abs(calendar_data[f][k]);
            // alert(centerWidth)
            cellG.append('rect')
                .attr('width', centerWidth)
                .attr('height', centerWidth)
                .attr('x', 10 + (cellWidth - 20 - centerWidth) / 2)
                .attr('y', 5 + (cellWidth - 20 - centerWidth) / 2)
                .attr('fill', calendar_data[f][k] > 0 ? '#7884D1' : '#A9DB69');

            // value legend
            cellG.append('text')
                .text(calendar_data[f][k])
                .attr('font-size', 10)
                .attr('x', cellWidth / 2)
                .attr('y', cellWidth - 5)
                .style("text-anchor", "middle");
        });

        // weight bar
        const barG = g.append('g').attr('transform', `translate(${50 + cellWidth * keys.length}, ${cellWidth * (i + 1)})`);
        barG.append('rect')
            .attr('width', 140)
            .attr('height', cellWidth - 20)
            .attr('x', 0)
            .attr('y', 5)
            .attr('fill', '#E8F5F6');

        barG.append('rect')
            .attr('width', 140 * Math.abs(calendar_data[f]['weight']))
            .attr('height', cellWidth - 35)
            .attr('x', 0)
            .attr('y', 12.5)
            .attr('fill', calendar_data[f]['weight'] > 0 ? '#7884D1' : '#A9DB69')
    });

    keys.map((k, i) => {
        const keyG = g.append('g').attr('transform', `translate(${cellWidth * (i + 1)}, ${20})`);

        keyG.append('rect')
            .attr('width', cellWidth - 20)
            .attr('height', cellWidth - 20)
            .attr('fill', '#E2E4EA');

        keyG.append('text')
            .attr('font-size', 14)
            .attr('x', cellWidth / 3)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .text(k);
    });

    const legendG = g.append('g').attr('transform', `translate(${50 + cellWidth * (keys.length)}, ${20})`);
    legendG.append('rect')
        .attr('width', 140)
        .attr('height', cellWidth - 20)
        .attr('fill', 'none')
        .attr('stroke', '#EBEAEA')

    legendG.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y', (cellWidth - 20) / 8)
        .attr('fill', '#7884D1');
    legendG.append('text')
        .attr('x', 30)
        .attr('y', 3 * (cellWidth - 20) / 8)
        .attr('font-size', 12)
        .text('正权重')

    legendG.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y', 5 * (cellWidth - 20) / 8)
        .attr('fill', '#A9DB69');
    legendG.append('text')
        .attr('x', 30)
        .attr('y', 7 * (cellWidth - 20) / 8)
        .attr('font-size', 12)
        .text('负权重')
}

function initialBarSelector(selector) {
    const clientWidth = d3.select(selector)[0][0].clientWidth;
    const svg = d3.select(selector).append('svg').attr('width', 3000).attr('height', 40);
    const g = svg.append('g');

    for (let ii = 0; ii < 13; ii++) {
        const buttonG = g.append('g').attr('transform', `translate(${ii * 40}, ${10})`);

        buttonG.append('rect')
            .attr('width', 30)
            .attr('height', 40)
            .attr('fill', '#F2F2F2');

        buttonG.append('text')
            .attr('x', 3)
            .attr('y', 18)
            .attr('font-size', 10)
            .text(`路径${ii}`)
    }
}

function initialBarGraph(selector) {
    data = [{ 'key': '路径长度', 'value': -2 }, { 'key': '信号灯数', 'value': -9 }, { 'key': '平均速度', 'value': 1 }, { 'key': '道路级别', 'value': 6 }, { 'key': '时间成本', 'value': 9 }, { 'key': '排名分数', 'value': 5 }]
    const clientWidth = d3.select(selector)[0][0].clientWidth - 20;
    const svg = d3.select(selector).append('svg').attr('width', clientWidth).attr('height', 40 * data.length);
    const g = svg.append('g');
    data.map((d, i) => {
        const barG = g.append('g').attr('transform', `translate(${20}, ${40 * i})`);
        const centerX = 80 + (clientWidth - 90) / 2 - 1;

        barG.append('rect')
            .attr('width', clientWidth)
            .attr('height', 40)
            .attr('fill', i % 2 == 0 ? '#E5F3F5' : 'white');
        barG.append('text')
            .attr('x', 10)
            .attr('y', 27)
            .text(d.key)
        barG.append('rect')
            .attr('x', centerX)
            .attr('y', 5)
            .attr('width', 2)
            .attr('height', 30)

        barG.append('rect')
            .attr('width', Math.abs(d.value) * 10)
            .attr('height', 30)
            .attr('x', d.value > 0 ? centerX + 1 : centerX + d.value * 10 - 1)
            .attr('y', 5)
            .attr('fill', d.value > 0 ? '#7884D1' : '#A9DB69')
    });
}