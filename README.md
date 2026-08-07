# 自用sing-box配置与规则

运行环境为OpenWRT momo 仅内核模式，使用 tun 入栈。  
禁用LAN 接口 IPV6 

当前配置文件需要 sing-box 版本为 1.14+

# 文件说明
direct.json 自定义直连列表，对应配置文件tag site-direct-self  
proxy.json 自定义代理列表，对应配置文件tag site-proxy-self  
emby.json 自用emby服务器列表，对应配置文件tag site-emby-self  

# 规则集来源
[sing-box geosite](https://github.com/SagerNet/sing-geosite/tree/rule-set)  
[DustinWin](https://github.com/DustinWin/ruleset_geodata/tree/main)  
[217heidai](https://github.com/217heidai/adblockfilters)
