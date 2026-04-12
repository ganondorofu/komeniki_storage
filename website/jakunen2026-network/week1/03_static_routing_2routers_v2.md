---
sidebar_position: 2
---

# 課題3 (復習): スタティックルーティング（2台間）

## トポロジー

```
                 10.1.0.0/30
    Fa0/1             Fa0/0           Fa0/0             Fa0/1
[R1]====172.16.1.0/24  10.1.0.1---10.1.0.2  172.16.2.0/24====[R2]
 .1                                                            .1
(LAN-A)                                                    (LAN-B)
```

```
ノード  インタフェース  IPアドレス          役割
R1     Fa0/0          10.1.0.1/30        R2へのリンク
R1     Fa0/1          172.16.1.1/24      LAN-A側
R2     Fa0/0          10.1.0.2/30        R1へのリンク
R2     Fa0/1          172.16.2.1/24      LAN-B側
```

## 手順

### Step 1: ターミナル環境設定（両ルータ）
何も見ずに以下を設定すること：
- hostname（R1、R2）
- no ip domain-lookup
- clock timezone JST 9
- enable secret cisco
- line con 0: exec-timeout 0 0 / length 0 / logging synchronous / privilege level 15 / password cisco / login
- line vty 0 4: password cisco / login

### Step 2: インタフェース設定（両ルータ）
上記IPアドレス表をもとに設定し、全インタフェースをup状態にする。

### Step 3: スタティックルーティング
- R1: LAN-B（172.16.2.0/24）へのルートを設定
- R2: LAN-A（172.16.1.0/24）へのルートを設定

## 達成確認
- `show ip route` で両ルータに `S` エントリがあること
- R1から `ping 172.16.2.1` が通ること
- R2から `ping 172.16.1.1` が通ること

## ポイント
- ネクストホップは「自分と直接つながっている相手のIF」のアドレス
  - R1のネクストホップ → 10.1.0.2（R2のFa0/0）
  - R2のネクストホップ → 10.1.0.1（R1のFa0/0）
