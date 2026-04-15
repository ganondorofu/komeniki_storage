---
sidebar_position: 5
---

# 通し練習 Run-3: Week1〜4 全設定（60分以内目標）

**対象範囲**: インタフェース・スタティックルーティング・静的NAT・動的PAT・拡張ACL・PPPoE・DHCP・IPv6 ACL  
**目安時間**: 60分以内  
**プロジェクト**: `review-week1-4-run1`（同プロジェクトを再利用）

---

## トポロジー

```
[R-WAN] Fa0/0 ─── Fa0/1 [R-BR] Fa0/0 ─── Fa0/0 [R-WS]
PPPoEサーバ              メイン設定対象          DHCPクライアント
(設定済み)               PPPoE/NAT/DHCP/ACL
198.51.100.1 (Lo0)       Dialer0: PPPoEで自動取得   172.20.0.x/24（DHCP）
8.8.8.8 (Lo1)            Fa0/0: 172.20.0.1/24

console ports:
R-WAN: telnet 192.168.0.15 5000
R-BR:  telnet 192.168.0.15 5001
R-WS:  telnet 192.168.0.15 5002
```

---

## IPアドレス一覧

| 機器 | インタフェース | アドレス | 備考 |
|------|-------------|---------|------|
| R-WAN | Fa0/0 | 設定なし（PPPoEサーバ） | |
| R-WAN | Lo0 | 198.51.100.1/32 | インターネット模擬 |
| R-WAN | Lo1 | 8.8.8.8/32 | DNS模擬 |
| R-BR | Fa0/1 | PPPoEで自動取得（Dialer0） | WAN側 |
| R-BR | Fa0/0 | 172.20.0.1/24 | LAN側 |
| R-WS | Fa0/0 | DHCPで自動取得 | |

IPv6（R-BR・R-WAN間）:

| 機器 | インタフェース | アドレス |
|------|-------------|---------|
| R-WAN | Fa0/0 | 2001:db8:1::1/64 |
| R-BR | Fa0/1 | 2001:db8:1::2/64 |

---

## 要件

### フェーズ0: ターミナル環境設定（全台）

全ルータで最初に実施（暗記で投入）:
- ホスト名: R-BR / R-WS（各ルータに合わせて）
- 特権モードパスワード: cisco
- DNSルックアップ無効化
- コンソール回線: ログ同期・タイムアウト無効
- タイムゾーン: JST +9
- ターミナル表示行数: 無制限

### フェーズ1: R-WAN 設定（設定済みルータ）

*このフェーズは既に設定済みのため、設定不要。*

### フェーズ2: R-BR 設定（メイン）

#### 2-1. PPPoEクライアント
- R-WAN との間に PPPoE 接続を確立する
- 認証: CHAP（username: BRANCH / password: netlab）
- MTU: 1492
- デフォルトルート: Dialer0 向け
- `no ip cef`（GNS3環境）

#### 2-2. LAN インタフェース
- Fa0/0: 172.20.0.1/24

#### 2-3. DHCPサーバ
- プール名: BRANCH_POOL
- ネットワーク: 172.20.0.0/24
- デフォルトGW: 172.20.0.1
- DNSサーバ: 198.51.100.1
- 除外アドレス: 172.20.0.1 〜 172.20.0.20

#### 2-4. 動的PAT
- 対象: 172.20.0.0/24
- NAT outside: Dialer0
- NAT inside: Fa0/0

#### 2-5. 拡張ACL（IPv4）
- ACL名: PROTECT_LAN
- **Dialer0 inbound** に適用すること
- 許可: established TCP
- 許可: ICMP echo-reply
- 拒否: それ以外すべて

#### 2-6. IPv6
- IPv6ルーティングを有効化
- Fa0/1 に 2001:db8:1::2/64 を設定すること

#### 2-7. IPv6 ACL
- ACL名: BLOCK_WAN_IPV6
- R-WAN（2001:db8:1::1）から R-BR への通信を拒否する
- NDは許可する（nd-na / nd-ns）
- 残りは許可
- Fa0/1 の **inbound** に適用

### フェーズ3: R-WS 設定

- Fa0/0: `ip address dhcp` / no shutdown

---

## 採点基準

| # | 確認内容 | コマンド / 場所 |
|---|---------|--------------|
| 1 | R-BR の Dialer0 が up/up でIPアドレス取得済み | `show ip interface brief` (R-BR) |
| 2 | R-BR から R-WAN Lo0 に ping が通る | `ping 198.51.100.1` (R-BR) |
| 3 | R-BR から 8.8.8.8 に ping が通る | `ping 8.8.8.8` (R-BR) |
| 4 | R-WS が DHCP でアドレス取得済み | `show ip interface brief` (R-WS) |
| 5 | R-WS から 198.51.100.1 に ping が通る（PAT経由） | `ping 198.51.100.1` (R-WS) |
| 6 | R-WAN から R-BR の Dialer0 IP への ping がブロックされる | `ping <Dialer0-IP>` (R-WAN) → fail |
| 7 | IPv4 ACL が正しく適用されている | `show ip access-lists` (R-BR) |
| 8 | R-WAN から R-BR IPv6アドレスへの ping がブロックされる | `ping 2001:db8:1::2` (R-WAN) → fail |
| 9 | IPv6 ACL が正しく適用されている | `show ipv6 access-list` (R-BR) |
