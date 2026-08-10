const { type, name } = $arguments

const compatible_outbound = {
    tag: 'COMPATIBLE',
    type: 'direct',
}

let compatible
let config = JSON.parse($files[0])

let proxies = await produceArtifact({
    name,
    type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
    platform: 'sing-box',
    produceType: 'internal',
})

// 加入所有节点
config.outbounds.push(...proxies)

let allProxiesTags = [];
allProxiesTags.push(...proxies.map(p => p.tag))


// ===== 分组 =====
const groups = {
    HK: [],
    TW: [],
    JP: [],
    SG: [],
    US: [],
    RD: [],
    LD: []
}

// ===== 规则（建议顺序：更“唯一”的优先）=====
const rules = {
    HK: /(港|hk|hong\s?kong|🇭🇰)/i,
    TW: /(台|tw|taiwan|🇹🇼)/i,
    JP: /(日本|jp|japan|🇯🇵)/i,
    SG: /(新加坡|singapore|\bsg\b|🇸🇬)/i,
    US: /(美国|united\s?states|\bus\b|🇺🇸)/i,
    LD: /(Z#)/i
}

// ===== 核心：唯一归属 =====
for (const p of proxies) {
    const tag = p.tag || ''




    if (rules.LD.test(tag)) {
        if (!(/(V6)/i.test(tag))) {
            p.detour = "Relay"
        }
        groups.LD.push(tag)
    } else if (rules.HK.test(tag)) {
        groups.HK.push(tag)
    } else if (rules.TW.test(tag)) {
        groups.TW.push(tag)
    } else if (rules.JP.test(tag)) {
        groups.JP.push(tag)
    } else if (rules.SG.test(tag)) {
        groups.SG.push(tag)
    } else if (rules.US.test(tag)) {
        groups.US.push(tag)
    } else {
        // 👇 只有没命中任何地区才会进 RD
        groups.RD.push(tag)
    }
}

// ===== 写入 =====
config.outbounds.forEach(i => {

    if (i.outbounds) {

        if (i.tag === "AUTO-HK") {
            i.outbounds.push(...groups.HK)
        } else if (i.tag === "AUTO-TW") {
            i.outbounds.push(...groups.TW)
        } else if (i.tag === "AUTO-JP") {
            i.outbounds.push(...groups.JP)
        } else if (i.tag === "AUTO-SG") {
            i.outbounds.push(...groups.SG)
        } else if (i.tag === "AUTO-US") {
            i.outbounds.push(...groups.US)
        } else if (i.tag === "AUTO-RD") {
            i.outbounds.push(...groups.RD)
        } else if (i.tag === "Relay") {
            // 中转节点
            i.outbounds.push(
                "AUTO-HK",
                "AUTO-TW",
                "AUTO-JP",
                "AUTO-SG",
                "AUTO-US",
                "AUTO-RD",
                ...allProxiesTags.filter(tag => !groups.LD.includes(tag))
            )
            i.outbounds.sort((a, b) => a.localeCompare(b))
            i.default = "AUTO-SG"
        } else if (i.tag === "Proxies") {
            i.outbounds.push(...allProxiesTags)
            i.outbounds.sort((a, b) => a.localeCompare(b))
        } else if (i.tag === "Testing") {
            i.outbounds.push(
                ...groups.LD
            )
            i.outbounds.sort((a, b) => a.localeCompare(b))
        } else if (i.tag === "DNSOUT") {
            i.outbounds.push(
                "Proxies",
                "AUTO-HK",
                "AUTO-TW",
                "AUTO-JP",
                "AUTO-SG",
                "AUTO-US",
                "AUTO-RD",
            )
            i.outbounds.sort((a, b) => a.localeCompare(b))
            i.default = "AUTO-SG"
        } else if (i.tag === "Auto") {
            i.outbounds.push(...allProxiesTags)
            i.outbounds.sort((a, b) => a.localeCompare(b))
        } else if (i.tag === "Bilibili" || i.tag === "Apple" || i.tag === "Microsoft") {
            i.outbounds.push(
                "Proxies",
                "DIRECT",
                ...allProxiesTags
            )
            i.default = "DIRECT"
        } else {
            i.outbounds.push(
                "Proxies",
                "DIRECT",
                ...allProxiesTags
            )
            i.default = "Proxies"
        }
    }


    if (Array.isArray(i.outbounds)) {
        i.outbounds = [...new Set(i.outbounds)]
    }
})

// ===== 防空 =====
config.outbounds.forEach(outbound => {
    if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
        if (!compatible) {
            config.outbounds.push(compatible_outbound)
            compatible = true
        }
        outbound.outbounds.push(compatible_outbound.tag)
    }
})



$content = JSON.stringify(config, null, 2)