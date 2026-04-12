---
sidebar_position: 2
---

# Week3-02: PPPoE + 動的PAT + DHCP 組み合わせ

## トポロジー

```
[R-LAN] Fa0/0 ---- Fa0/1 [R-GW] Fa0/0 ---- Fa0/0 [R-ISP]
  DHCPクライアント    GW/DHCP/NAT    PPPoE接続    PPPoEサーバ
```

- R-ISP と R-GW 間: PPPoE（Fa0/0同士）
- R-GW と R-LAN 間: FastEthernet（Fa0/1 ↔ Fa0/0）

## IPアドレス

| ルータ | インタフェース | アドレス |
|--------|--------------|---------|
| R-ISP | Fa0/0 | PPPoEサーバ（アドレス不要） |
| R-ISP | Loopback0 | 203.0.113.1/24（インターネット模擬） |
| R-ISP | Dialer-pool | クライアントに 100.0.0.1/32 を払い出す |
| R-GW | Dialer0 | PPPoEで取得（100.0.0.1/32） |
| R-GW | Fa0/1 | 192.168.10.1/24 |
| R-LAN | Fa0/0 | DHCPで取得（192.168.10.x） |

## 要件

### R-GW（メイン設定対象）
ターミナル環境設定:
- ホスト名: R-GW
- 特権パスワード: cisco
- DNSルックアップ無効化
- コンソール: ログ同期・タイムアウト無効
- タイムゾーン: JST +9
- ターミナル行数: 無制限

PPPoEクライアント:
- Dialer0: ip address negotiated / encapsulation ppp / dialer pool 1 / mtu 1492
- ppp chap hostname / ppp chap password
- Fa0/0: pppoe-client dial-pool-number 1 / no ip address
- デフォルトルート: Dialer0向け

LAN インタフェース:
- Fa0/1: 192.168.10.1/24

DHCPサーバ:
- プール名: LAN_POOL
- ネットワーク: 192.168.10.0/24
- デフォルトゲートウェイ: 192.168.10.1
- DNSサーバ: 203.0.113.1
- 除外アドレス: 192.168.10.1 〜 192.168.10.10

動的PAT:
- 標準ACL 1: 192.168.10.0/24 を permit
- ip nat inside source list 1 interface Dialer0 overload
- Fa0/1: ip nat inside
- Dialer0: ip nat outside

### R-LAN
ターミナル環境設定:
- ホスト名: R-LAN
- 特権パスワード: cisco
- DNSルックアップ無効化
- コンソール: ログ同期・タイムアウト無効
- タイムゾーン: JST +9
- ターミナル行数: 無制限

インタフェース:
- Fa0/0: ip address dhcp / no shutdown

## テスト

| 送信元 | 宛先 | 結果 |
|--------|------|------|
| R-LAN | 203.0.113.1 | 通る |
