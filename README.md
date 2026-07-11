# 自用sing-box配置与规则

运行环境为OpenWRT momo 仅内核模式，使用 tun 入栈。  
禁用LAN 接口 IPV6 

当前配置文件需要 sing-box 版本为 1.14+

# 文件说明
direct.json 自定义直连列表，对应配置文件tag site-direct-self  
proxy.json 自定义代理列表，对应配置文件tag site-proxy-self  
emby.json 自用emby服务器列表，对应配置文件tag site-emby-self  

# 一些个人见解
## realip vs fakeip 
本仓库配置使用realip模式，不使用fakeip模式，具体区别自己百度，我个人认为多那么几十毫秒的延迟无所谓，fakeip 我个人在使用过程中会出现网站莫名其妙连不上，这也是为什么我从mihomo转向sing-box 的原因。
## ipv4 vs ipv6  
本仓库配置使用ipv4 不支持ipv6, 因为现在代理服务器有的存在v6有的不存在v6，我们使用的是fakeip ，也就是说我们访问网站是本地解析的，而不是在远程服务器解析，故本地解析如果不禁用v6 ，那我们的解析结果会有v6记录，当sing-box将解析结果返回给发起者后，发起者会有自己的选择策略，如果其选择v6，而你的代理服务器没有v6，那么就会出现无法访问的情况。  
## Tun模式 vs 透明代理模式tproxy redirect
本仓库配置使用tun模式，不使用透明代理模式，目前tun模式性能在日常使用中与透明代理模式无异，并且为了配合ipv4_only ，tun模式更方便禁用v6 ，除此之外，tun模式还可以防止webrtc 泄露  

以上仅为个人见解，此仓库也仅用于自用。

# 规则集来源
[sing-box geosite](https://github.com/SagerNet/sing-geosite/tree/rule-set)  
[DustinWin](https://github.com/DustinWin/ruleset_geodata/tree/main)  
[217heidai](https://github.com/217heidai/adblockfilters)
