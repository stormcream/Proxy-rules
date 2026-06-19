# 自用sing-box配置与规则

运行环境为OpenWRT momo 仅内核模式，使用 tun 版配置文件。  
理论上 Tun 版配置文件修改一下 inbound 也可以全平台通用。  
另一个为透明代理版本(tproxy)，因为目前不常用，随缘更新。  

当前配置文件需要 sing-box 版本为 1.14+

# 文件说明
direct.json 自定义直连列表，对应配置文件tag site-direct-self  
proxy.json 自定义代理列表，对应配置文件tag site-proxy-self  
emby.json 自用emby服务器列表，对应配置文件tag site-emby-self  

# 规则集来源
[sing-box geosite](https://github.com/SagerNet/sing-geosite/tree/rule-set)  
[DustinWin](https://github.com/DustinWin/ruleset_geodata/tree/main)  
[217heidai](https://github.com/217heidai/adblockfilters)
