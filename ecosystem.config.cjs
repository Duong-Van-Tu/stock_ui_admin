module.exports = {
  apps : [{
    name   : "stock_ui_dev",
    script : "sudo npm run start -- -p 3002",
    error_file : "/webapps/html/log_pm2/stock_ui_dev/err_dev.log",
    out_file : "/webapps/html/log_pm2/stock_ui_dev/out_dev.log",
    log_date_format : "YYYY-MM-DD HH:mm Z",
    node_args: "--max-old-space-size=2048"
  }]
}


