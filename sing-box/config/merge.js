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

const relay_tag = "RELAY"

const self_tags = {
    HK: ['S-HK', 'A-HK'],
    TW: ['S-TW', 'A-TW'],
    JP: ['S-JP', 'A-JP'],
    SG: ['S-SG', 'A-SG'],
    US: ['S-US', 'A-US'],
    RD: ['S-RD', 'A-RD']
}


// ===== 分组 =====
const groups = {
    HK: [],
    TW: [],
    JP: [],
    SG: [],
    US: [],
    RD: [],
    LD: [],
    ALL: []
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
        p.detour = relay_tag
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
    // 👇 所有节点都归入 ALL
    groups.ALL.push(tag)
}

// ===== 写入 =====
config.outbounds.forEach(i => {

    if (i.outbounds) {

        if (i.tag === "S-HK" || i.tag === "A-HK") {
            i.outbounds.push(...groups.HK)
        } else if (i.tag === "S-TW" || i.tag === "A-TW") {
            i.outbounds.push(...groups.TW)
        } else if (i.tag === "S-JP" || i.tag === "A-JP") {
            i.outbounds.push(...groups.JP)
        } else if (i.tag === "S-SG" || i.tag === "A-SG") {
            i.outbounds.push(...groups.SG)
        } else if (i.tag === "S-US" || i.tag === "A-US") {
            i.outbounds.push(...groups.US)
        } else if (i.tag === "S-RD" || i.tag === "A-RD") {
            i.outbounds.push(...groups.RD)
        } else if (i.tag === relay_tag) {
            i.outbounds.push(
                ...self_tags.HK,
                ...self_tags.TW,
                ...self_tags.JP,
                ...self_tags.SG,
                ...self_tags.US,
                ...self_tags.RD
            )
            i.outbounds.sort((a, b) => a.localeCompare(b))
            i.default = "A-SG"
        } else if (i.tag === "PROXY") {
            i.outbounds.push(
                ...self_tags.HK,
                ...self_tags.TW,
                ...self_tags.JP,
                ...self_tags.SG,
                ...self_tags.US,
                ...self_tags.RD,
                ...groups.LD
            )
            i.outbounds.sort((a, b) => a.localeCompare(b))
            i.default = "A-SG"
        } else if (i.tag === "AUTO-TESTING") {
            i.outbounds.push(
                ...groups.LD
            )
            i.outbounds.sort((a, b) => a.localeCompare(b))
        } else if (i.tag === "DNS") {
            i.outbounds.push(
                "PROXY",
                ...self_tags.HK,
                ...self_tags.TW,
                ...self_tags.JP,
                ...self_tags.SG,
                ...self_tags.US,
                ...self_tags.RD,
                ...groups.LD
            )
            i.outbounds.sort((a, b) => a.localeCompare(b))
            i.default = "PROXY"
        } else if (i.tag === "AUTO-SELECT") {
            i.outbounds.push(
                self_tags.HK[1],
                self_tags.TW[1],
                self_tags.SG[1],
                self_tags.JP[1],
                self_tags.US[1],
                self_tags.RD[1]
            )
            i.outbounds.sort((a, b) => a.localeCompare(b))
        } else if (i.tag === "EMBY") {
            i.outbounds.push(
                "PROXY",
                "DIRECT",
                ...self_tags.HK,
                ...self_tags.TW,
                ...self_tags.JP,
                ...self_tags.SG,
                ...self_tags.US,
                ...self_tags.RD,
                ...groups.LD
            )
           i.outbounds.sort((a, b) => a.localeCompare(b))
           i.default = "PROXY"
        } else {
            i.outbounds.push(
                "PROXY",
                "DIRECT"
            )
            i.default = "PROXY"
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