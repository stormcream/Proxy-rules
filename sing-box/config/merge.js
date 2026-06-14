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
    HK: ['HK-SELECT', 'HK-AUTO'],
    TW: ['TW-SELECT', 'TW-AUTO'],
    JP: ['JP-SELECT', 'JP-AUTO'],
    SG: ['SG-SELECT', 'SG-AUTO'],
    US: ['US-SELECT', 'US-AUTO'],
    RD: ['RD-SELECT', 'RD-AUTO']
}


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
    LD: /(落地)/i
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
}

// ===== 写入 =====
config.outbounds.forEach(i => {

    if (i.outbounds) {

        if (i.tag === "HK-SELECT" || i.tag === "HK-AUTO") {
            i.outbounds.push(...groups.HK)
        } else if (i.tag === "TW-SELECT" || i.tag === "TW-AUTO") {
            i.outbounds.push(...groups.TW)
        } else if (i.tag === "JP-SELECT" || i.tag === "JP-AUTO") {
            i.outbounds.push(...groups.JP)
        } else if (i.tag === "SG-SELECT" || i.tag === "SG-AUTO") {
            i.outbounds.push(...groups.SG)
        } else if (i.tag === "US-SELECT" || i.tag === "US-AUTO") {
            i.outbounds.push(...groups.US)
        } else if (i.tag === "RD-SELECT" || i.tag === "RD-AUTO") {
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
            i.default = "SG-AUTO"
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
            i.default = "SG-AUTO"
        } else if (i.tag === "AUTO-TEST") {
            i.outbounds.push(
                ...groups.LD
            )
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
            i.default = "SG-AUTO"
        } else {
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