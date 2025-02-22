module.exports = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.csv$/,
            use: ["csv-loader"],
        });
        return config;
    },
};