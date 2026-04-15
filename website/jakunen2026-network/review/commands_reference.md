---
sidebar_position: 99
---

# コマンドリファレンス

## 設定確認・一覧表示

### ACL
```
show ip access-lists               # IPv4 ACL一覧（マッチ数も表示）
show ip access-lists <名前>        # 特定ACLのみ
show ipv6 access-list              # IPv6 ACL一覧
show ipv6 access-list <名前>       # 特定ACLのみ
show run | include access-group    # ACLがどのIFに適用されているか
show ipv6 interface <IF名>         # IPv6 ACL適用状況（traffic-filter）
```

### DHCP
```
show ip dhcp pool                  # プール一覧（名前・範囲・除外）
show ip dhcp binding               # 払い出し済みIPの一覧
show ip dhcp conflict              # アドレス競合の記録
show run | section dhcp            # DHCP設定のセクション表示
```

### NAT / PAT
```
show ip nat translations           # 現在のNATテーブル
show ip nat statistics             # NATの統計情報
show run | include ip nat          # NAT設定の確認
```

### PPPoE
```
show pppoe session                 # PPPoEセッション一覧・状態
show ip interface brief            # Dialer0のIP取得確認
show interface Dialer0             # Dialer0の詳細
```

### ルーティング
```
show ip route                      # IPv4ルーティングテーブル
show ipv6 route                    # IPv6ルーティングテーブル
```

---

## 削除・クリアコマンド

### ACL エントリ削除

**シーケンス番号指定で1行だけ削除:**
```
ip access-list extended <名前>
 no <シーケンス番号>              # 例: no 10

ipv6 access-list <名前>
 no sequence <番号>              # 例: no sequence 40
```

**ACL全体を削除:**
```
no ip access-list extended <名前>
no ip access-list standard <名前>
no ipv6 access-list <名前>
```

:::caution
ACLがインタフェースに適用されたまま削除すると空のACLが残ることがある。
再作成時は全削除→作り直しが確実。
:::

### DHCP

```
clear ip dhcp binding *            # 全バインディング削除
clear ip dhcp binding <IPアドレス> # 特定IPのバインディング削除
clear ip dhcp conflict *           # 競合記録を削除
no ip dhcp pool <名前>             # プール定義ごと削除
```

### NAT / PAT

```
clear ip nat translation *         # NATテーブルを全クリア
```

### PPPoE

```
clear pppoe all                    # PPPoEセッションを全クリア（サーバー側で実行）
```

---

## よくある原則

- **ACLのルール順**: 詳細（狭い範囲）なルールを先に書く。`permit any any` は最後。
- **IPv6 ACL適用先**: IPv6アドレスが設定されているインタフェースに適用する（PPPoE環境ではDialer0ではなくFa0/1）。
- **IPv4 ACL（PPPoE環境）**: Dialer0 inboundに適用する。
