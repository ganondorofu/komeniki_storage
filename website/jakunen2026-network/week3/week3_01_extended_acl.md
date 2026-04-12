---
sidebar_position: 1
---

# Week3-01: 拡張ACL（established句）

## established句とは

Week2のPATで使ったACLは「標準ACL」で、送信元IPだけを条件にしていた。

「拡張ACL」はさらに以下を条件にできる:
- 送信元IP / 宛先IP
- プロトコル（tcp / udp / icmp）
- ポート番号

`established` は拡張ACLのTCPオプション。
**ACKフラグが立っているTCPパケットだけを許可**する。

| パケットの種類 | SYN | ACK | established で許可されるか |
|--------------|-----|-----|--------------------------|
| 接続開始（外→内） | あり | なし | 拒否 |
| 返答（内→外の通信への返り） | なし | あり | 許可 |

→ 内側から始めた通信の返りは通す。外側からの新規接続は通さない。

---

## トポロジー

```
[R1 Lo0:192.168.1.1/24]──[R1 fa0/0]──[R2 fa0/0]──[R2 Lo0:10.0.0.1/32]
                           203.0.113.1/30  203.0.113.2/30
```

| 機器 | インタフェース | IPアドレス |
|------|-------------|----------|
| R1 | Loopback0 | 192.168.1.1/24 |
| R1 | fa0/0 | 203.0.113.1/30 |
| R2 | fa0/0 | 203.0.113.2/30 |
| R2 | Loopback0 | 10.0.0.1/32 |

GNS3: R1=port 5000, R2=port 5001

---

## ターミナル環境設定（全ルータで最初に実行）

```
enable
configure terminal
hostname <名前>
enable secret cisco
no ip domain-lookup
line con 0
 logging synchronous
 exec-timeout 0 0
exit
clock timezone JST 9
terminal length 0
```

---

## 課題

### Step 1: インタフェース設定

R1・R2 それぞれのインタフェースにIPアドレスを設定する。

### Step 2: スタティックルーティング

- R1: 10.0.0.0/8 → 203.0.113.2
- R2: 192.168.1.0/24 → 203.0.113.1

### Step 3: 拡張ACL（established句なし）

R1 の fa0/0 inbound に適用。まず established なしで設定。

```
ip access-list extended ACL-IN
 permit tcp any any
 deny   ip any any
interface fa0/0
 ip access-group ACL-IN in
```

動作確認: R2 から R1 へ `telnet 203.0.113.1` → 通る

### Step 4: 拡張ACL（established句あり）

ACLを書き換えて established を追加する。

```
ip access-list extended ACL-IN
 no permit tcp any any
 permit tcp any any established
 deny   ip any any
```

動作確認:
- R1 から R2 へ `telnet 203.0.113.2` → 通る（返りパケットが established で許可）
- R2 から R1 へ `telnet 203.0.113.1` → 拒否される（新規SYNがブロック）

---

## 確認コマンド

```
show ip access-lists
show ip route
```

---

## 採点ポイント

- [ ] R1・R2 インタフェース設定・疎通確認（ping 203.0.113.2）
- [ ] スタティックルート設定（ping 10.0.0.1 from R1）
- [ ] established なし: R2→R1 の telnet が通る
- [ ] established あり: R2→R1 の telnet が拒否される
- [ ] established あり: R1→R2 の telnet は通る
