var studies = require('../studies');
var Base = require('./base');
var Call = require('../positions/call');
var Put = require('../positions/put');

// Define studies to use.
var studyDefinitions = [];

function MorningTrend() {
    this.constructor = MorningTrend;
    Base.call(this);

    this.prepareStudies(studyDefinitions);
}

// Create a copy of the Base "class" prototype for use in this "class."
MorningTrend.prototype = Object.create(Base.prototype);

MorningTrend.prototype.backtest = function(data, investment, profitability) {
    var self = this;
    var timestampDate;
    var priceAt1am = 0.0;
    var previousDataPoint;

    // For every data point...
    data.forEach(function(dataPoint) {
        // Simulate the next tick, and process update studies for the tick.
        self.tick(dataPoint);

        timestampDate = new Date(dataPoint.timestamp);

        if (timestampDate.getHours() === 1 && timestampDate.getMinutes() === 0) {
            priceAt1am = previousDataPoint.price;
        }

        if (timestampDate.getHours() === 9 && timestampDate.getMinutes() === 0) {
            if (previousDataPoint.price > priceAt1am) {
                self.addPosition(new Call(dataPoint.symbol, dataPoint.timestamp, previousDataPoint.price, investment, profitability, 60));
            }
            else {
                self.addPosition(new Put(dataPoint.symbol, dataPoint.timestamp, previousDataPoint.price, investment, profitability, 60));
            }
        }

        // Track the current data point as the previous data point for the next tick.
        previousDataPoint = dataPoint;
    });

    // Show the results.
    console.log('SYMBOL:\t\t' + previousDataPoint.symbol);
    console.log('PROFIT/LOSS:\t$' + self.getProfitLoss());
    console.log('WIN RATE:\t' + self.getWinRate());
    console.log('WINS:\t\t' + self.winCount);
    console.log('LOSSES:\t\t' + self.loseCount);

    // Save the output to a file.
    this.saveOutput();
};

module.exports = MorningTrend;
