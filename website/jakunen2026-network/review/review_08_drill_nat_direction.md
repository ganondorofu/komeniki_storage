---
sidebar_position: 8
---

# 単発ドリル R-08: NAT方向（inside/outside・PPPoE動的NAT）

**対象範囲**: NATのinside/outside設定のみ
**目安時間**: 10〜15分
**背景**: 4月のNAT初学習から直近round20まで一貫して発生している唯一のミスパターン。PPPoE環境での動的NATに絞って反復

---

## トポロジー

```
[ISP] ══PPPoE══ [R-Gnm] ── Fa0/1 ── (192.168.1.0/24、クライアント無し・DHCP動作のみ確認)
既設定・触らない    まっさら
```

console: R-Gnm = `telnet 192.168.0.15 5010`（write erase済み）

---

## PPPoE接続情報

- CHAPユーザー名: `ppp-user`
- CHAPパスワード: `R6pass`
- MTU: 1492

---

## 要件

1. PPPoEクライアントをDialer0に設定（`ip address negotiated`・`dialer pool 1`を忘れずに）
2. Fa0/0に`pppoe-client dial-pool-number 1`
3. Fa0/1: `192.168.1.254/24`、DHCPサーバ設定（範囲任意、`.254`除外）
4. **動的NAT(NAPT)**: `192.168.1.0/24`→Dialer0経由で変換
5. デフォルトルートをDialer0へ

**チェックポイント（過去のミス）**:
- outsideは物理インタフェース(Fa0/0)ではなく**Dialer0**
- `ip nat inside`を内部インタフェース(Fa0/1)に付け忘れない
- ACLの`permit`範囲に変換したいネットワークが入っているか確認
- `overload`を付け忘れると1対1のNATになってしまう

---

## テストコマンド

| テスト | 期待結果 |
|---|---|
| `show ip interface brief` | Dialer0にグローバルアドレスが付与されている |
| `show ip nat translations`（何かトラフィックを流した後） | 変換エントリが表示される |
| `show run interface Dialer0` | `ip nat outside`が付いている |
| `show run interface FastEthernet0/1` | `ip nat inside`が付いている |
