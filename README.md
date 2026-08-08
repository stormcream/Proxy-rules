# 自用sing-box配置与规则

sing-box >= 1.14.0-beta.9  
开启 OpenWRT momo 仅内核模式  
关闭 OpenWRT LAN 接口 IPV6 保留 wan 口 IPV6  
关闭 OpenWRT DNS 重定向  

本配置支持IPV6节点，即被代理机只能使用代理机的IPV4访问目标网站，但是在代理机存在IPV6且可用的情况下，sing-box与代理机器之间以IPV6优先通信，代理机表现为IPV6入，IPV4出，否则为IPV4入，IPV4出  

# 文件说明
direct.json 自定义直连列表，对应配置文件tag rule-direct-self  
proxy.json 自定义代理列表，对应配置文件tag rule-proxy-self  
emby.json 自用emby服务器列表，对应配置文件tag rule-emby-self  
