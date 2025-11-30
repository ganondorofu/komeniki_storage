---
sidebar_position: 2
description: BIND9によるDNSサーバー設定ガイド
---

# DNS設定の虎の巻

DNSサーバー（BIND9）の設定方法を解説します。この資料は技能競技大会のDNS設定課題に基づいています。

## 1. パッケージのインストール

```bash
# BINDのインストール
sudo apt update
sudo apt install bind9 bind9utils dnsutils
```

## 2. 主要な設定ファイル

| ファイル | 説明 |
|---------|------|
| `/etc/bind/named.conf` | メイン設定ファイル |
| `/etc/bind/named.conf.options` | グローバルオプション設定 |
| `/etc/bind/named.conf.local` | ゾーン定義 |
| `/etc/bind/named.conf.default-zones` | デフォルトゾーン定義 |
| `/etc/bind/` | ゾーンファイル保存ディレクトリ |

## 3. 基本設定（named.conf.options）

```conf
options {
    directory "/etc/bind";
    
    // DNSSECの検証を無効化
    dnssec-validation no;
    
    // 自身での反復問い合わせを行わない
    recursion no;
    
    // 特定のネットワークのみから再帰的な問い合わせを許可
    allow-recursion { 192.168.1.0/24; 192.168.2.0/24; };
    
    // IPv4とIPv6の両方をリッスン
    listen-on { any; };
    listen-on-v6 { any; };
    
    // バージョン情報を隠す
    version "not disclosed";
};
```

## 4. マスターゾーンの設定例（named.conf.local）

```conf
// マスターゾーン設定例
zone "osaka-skills.jp" {
    type master;
    file "/etc/bind/db.osaka-skills.jp";
    allow-transfer { 192.168.1.1; }; // ゾーン転送の許可
    notify yes; // ゾーンの更新をスレーブに通知
};

// 逆引きゾーン設定例
zone "1.168.192.in-addr.arpa" {
    type master;
    file "/etc/bind/db.192.168.1";
    allow-transfer { 192.168.1.1; };
    notify yes;
};
```

## 5. スレーブゾーンの設定例（named.conf.local）

```conf
// スレーブゾーン設定例
zone "osaka-skills.jp" {
    type slave;
    file "/etc/bind/db.osaka-skills.jp";
    masters { 201.10.0.25; }; // マスターサーバーのIP
};

// 逆引きスレーブゾーン
zone "1.168.192.in-addr.arpa" {
    type slave;
    file "/etc/bind/db.192.168.1";
    masters { 201.10.0.25; };
};
```

## 6. フォワーダー設定（named.conf.options）

```conf
options {
    // 他のオプション設定...
    
    // 転送先サーバー設定
    forwarders {
        200.99.1.1; // svのIPアドレス
    };
    
    // 転送先からの応答がない場合は反復問い合わせを行わない
    forward only;
};
```

## 7. ゾーンファイルの作成

### 内部向け正引きゾーンファイル例（/etc/bind/internal/db.osaka-skills.jp）

```conf
$TTL    604800
@       IN      SOA     osv1.osaka-skills.jp. admin.osaka-skills.jp. (
                        2025080101      ; Serial（YYYYMMDDNN形式）
                        604800          ; Refresh（7日）
                        86400           ; Retry（1日）
                        2419200         ; Expire（28日）
                        604800 )        ; Negative Cache TTL（7日）

; ネームサーバーの定義（短縮形とFQDN形式の両方を示す）
@       IN      NS      osv1            ; 短縮形（自動的にosaka-skills.jpが補完される）
@       IN      NS      osv2            ; 短縮形

; MXレコード（メールサーバー）
@       IN      MX  10  mail            ; mail.osaka-skills.jp（osv1のエイリアス）
@       IN      MX  20  osv2            ; 短縮形（課題要件：osv2をMXレコードに登録）

; Aレコード（IPv4アドレス）
osv1    IN      A       201.10.0.25
osv2    IN      A       192.168.1.1
mail    IN      A       201.10.0.25     ; メールサーバー用エイリアス（osv1）

; CNAMEレコード（エイリアス）
www     IN      CNAME   osv1            ; 短縮形（課題要件：osv1の別名としてwww）
sec     IN      A       201.10.0.25     ; セキュアサイト用（課題要件）
in      IN      CNAME   osv2            ; 短縮形（課題要件：osv2の別名としてin）

; AAAAレコード（IPv6アドレス）
www6    IN      AAAA    2001:DB8:3:100::1  ; 課題要件：osv1のIPv6アドレス
```

### 外部向け正引きゾーンファイル例（/etc/bind/external/db.osaka-skills.jp）

```conf
$TTL    604800
@       IN      SOA     osv1.osaka-skills.jp. admin.osaka-skills.jp. (
                        2025080101      ; Serial（YYYYMMDDNN形式）
                        604800          ; Refresh（7日）
                        86400           ; Retry（1日）
                        2419200         ; Expire（28日）
                        604800 )        ; Negative Cache TTL（7日）

; ネームサーバーの定義（外部向けには権威サーバーのみ公開）
@       IN      NS      osv1.osaka-skills.jp.

; MXレコード（メールサーバー - 外部向けにはosv1のみ公開）
@       IN      MX  10  mail.osaka-skills.jp.

; 公開サーバーのAレコード
osv1    IN      A       201.10.0.25
mail    IN      A       201.10.0.25     ; 課題要件：osv1をmail.osaka-skills.jpとして登録
; osv2は内部サーバーなので外部には公開しない

; 公開サービスのみCNAME/Aレコード
www     IN      CNAME   osv1.osaka-skills.jp.  ; 課題要件：osv1の別名としてwww
sec     IN      A       201.10.0.25            ; 課題要件：secのIPv4アドレス
; 内部専用のinエイリアスは外部には公開しない

; AAAAレコード（IPv6アドレス）
www6    IN      AAAA    2001:DB8:3:100::1      ; 課題要件：www6のIPv6アドレス
```
```

### 逆引きゾーンファイル例（/etc/bind/internal/db.192.168.1）

```conf
$TTL    604800
@       IN      SOA     osv1.osaka-skills.jp. admin.osaka-skills.jp. (
                        2025080101      ; Serial
                        604800          ; Refresh
                        86400           ; Retry
                        2419200         ; Expire
                        604800 )        ; Negative Cache TTL

; ネームサーバーの定義
@       IN      NS      osv1.osaka-skills.jp.
@       IN      NS      osv2.osaka-skills.jp.

; 逆引きレコード（逆引きゾーンでは完全なFQDNを指定する必要がある）
1       IN      PTR     osv2.osaka-skills.jp.    ; osv2のIPアドレス
10      IN      PTR     intra.osaka-skills.jp.   ; 内部専用サーバー
```

## 8. BINDの起動と管理

```bash
# BINDサービスの起動
sudo systemctl start bind9

# 自動起動の有効化
sudo systemctl enable bind9

# サービスステータスの確認
sudo systemctl status bind9

# 設定変更後の再読み込み
sudo systemctl reload bind9
```

## 9. 設定の検証

```bash
# 設定ファイルの構文チェック
sudo named-checkconf

# ゾーンファイルの構文チェック（内部向け）
sudo named-checkzone osaka-skills.jp /etc/bind/internal/db.osaka-skills.jp
sudo named-checkzone 1.168.192.in-addr.arpa /etc/bind/internal/db.192.168.1

# ゾーンファイルの構文チェック（外部向け）
sudo named-checkzone osaka-skills.jp /etc/bind/external/db.osaka-skills.jp

# DNSサーバーの動作確認（課題要件のレコード）
# 内部ネットワークからの確認
dig @localhost osaka-skills.jp NS
dig @localhost www.osaka-skills.jp   # osv1のエイリアス
dig @localhost in.osaka-skills.jp    # osv2のエイリアス
dig @localhost mail.osaka-skills.jp  # osv1のメールサーバー設定
dig @localhost sec.osaka-skills.jp   # セキュアサイト用
dig @localhost www6.osaka-skills.jp AAAA # IPv6アドレス
dig @localhost -x 192.168.1.1        # 逆引き（osv2）

# 外部と内部で異なる応答が返されるか確認
# 外部からの問い合わせをシミュレート
dig @201.10.0.25 osaka-skills.jp MX  # 外部ではosv1のみが応答
# 内部からの問い合わせをシミュレート
dig @192.168.1.1 osaka-skills.jp MX  # 内部ではosv1とosv2が応答
```

## 10. シナリオ別設定例

### 競技課題におけるosv1設定（要件に沿った実装）

**named.conf.options:**
```conf
options {
    directory "/etc/bind";
    
    // 課題要件：DNSSECの検証を無効にする
    dnssec-validation no;
    
    // グローバルオプション
    listen-on { any; };
    listen-on-v6 { any; };
    
    // バージョン情報を隠す
    version "not disclosed";
};
```

**named.conf.local:**
```conf
// 大阪事業所ネットワーク用ビュー（内部）
view "internal" {
    // 課題要件：大阪事業所ネットワークからのみ再帰問い合わせを許可
    match-clients { 192.168.1.0/24; 192.168.2.0/24; 127.0.0.1; };
    
    // 内部向けオプション
    recursion yes;
    allow-recursion { any; };
    
    // 課題要件：自身で保持していないレコードはsvへ回送
    forwarders {
        200.99.1.1; // svのIPアドレス
    };
    // 課題要件：回送先からの応答がない場合も自身での反復問い合わせを行わない
    forward only;
    
    // 課題要件：内部向けスレーブゾーン（osv2がマスター）
    zone "osaka-skills.jp" {
        type slave;
        file "/etc/bind/internal/db.osaka-skills.jp";
        masters { 192.168.1.1; }; // osv2からゾーン転送
    };
    
    // 逆引きゾーン
    zone "1.168.192.in-addr.arpa" {
        type slave;
        file "/etc/bind/internal/db.192.168.1";
        masters { 192.168.1.1; }; // osv2からゾーン転送
    };
};

// 外部ネットワーク用ビュー
view "external" {
    match-clients { any; };
    
    // 課題要件：外部からの再帰問い合わせは許可しない
    recursion no;
    
    // 課題要件：外部向けマスターゾーン
    zone "osaka-skills.jp" {
        type master;
        file "/etc/bind/external/db.osaka-skills.jp";
        allow-transfer { 192.168.1.1; }; // osv2へのゾーン転送許可
        notify yes;
    };
};
```

### 競技課題におけるosv2設定（要件に沿った実装）

**named.conf.options:**
```conf
options {
    directory "/etc/bind";
    
    // 課題要件：DNSSECの検証を無効にする
    dnssec-validation no;
    
    // グローバルオプション
    listen-on { any; };
    version "not disclosed";
};
```

**named.conf.local:**
```conf
// 大阪事業所ネットワーク用ビュー
view "internal" {
    // osv1も含めた内部ネットワークからのアクセスを許可
    match-clients { 192.168.1.0/24; 192.168.2.0/24; 127.0.0.1; 201.10.0.25; };
    
    // 内部向けオプション
    recursion yes;
    allow-recursion { any; };
    
    // 課題要件：自身で保持していないレコードはosv1へ回送
    forwarders {
        201.10.0.25; // osv1のIPアドレス
    };
    // 課題要件：回送先からの応答がない場合も自身での反復問い合わせを行わない
    forward only;
    
    // 課題要件：内部向けマスターゾーン
    zone "osaka-skills.jp" {
        type master;
        file "/etc/bind/internal/db.osaka-skills.jp";
        // 課題要件：ゾーン転送はosv1へのみ許可
        allow-transfer { 201.10.0.25; };
        notify yes;
    };
    
    // 逆引きゾーン
    zone "1.168.192.in-addr.arpa" {
        type master;
        file "/etc/bind/internal/db.192.168.1";
        allow-transfer { 201.10.0.25; };
        notify yes;
    };
};
```
```

:::tip 競技課題のDNS設定ポイント
1. シリアル番号を必ず更新する（ゾーンファイル変更時）
2. 設定変更後は必ず構文チェックを行う（`named-checkconf`と`named-checkzone`）
3. IPv4とIPv6の両方のレコードを適切に設定する（課題ではosv1のIPv6アドレスにwww6を割り当て）
4. マスター/スレーブの関係を正しく設定する
   - osv2：内部向けマスター
   - osv1：外部向けマスター、内部向けスレーブ
5. 転送設定（forwarders）を適切に設定する
   - osv1：svへ転送
   - osv2：osv1へ転送
6. ゾーン転送のセキュリティに注意する（allow-transferで制限）
7. 内部/外部ネットワークの分離にviewディレクティブを使用する
8. 課題の要件に沿ったレコードを確実に設定する
   - mail.osaka-skills.jp（osv1）
   - www.osaka-skills.jp（osv1の別名）
   - sec.osaka-skills.jp（osv1のIPv4アドレス）
   - www6.osaka-skills.jp（osv1のIPv6アドレス）
   - in.osaka-skills.jp（osv2の別名）
   - osv2のMXレコード登録
:::

:::warning 競技中によくある問題と解決法
- **DNSサーバーが起動しない**: 
  - ログ(`/var/log/syslog`)で構文エラーを確認
  - `sudo named-checkconf`で設定ファイルの構文を検証
  
- **ゾーン転送が失敗する**: 
  - `allow-transfer`の設定を確認
  - マスターサーバーのIPアドレスが正しいか確認
  - `named.conf`のアクセス制御設定を確認

- **名前解決ができない**: 
  - `dig @localhost ドメイン名`でサーバーの応答を確認
  - ゾーンファイルのレコード設定を確認
  - サービスが実行中か`sudo systemctl status bind9`で確認

- **マスター/スレーブ同期の問題**:
  - マスターでのnotify設定を確認
  - スレーブでのmasters設定を確認
  - シリアル番号が更新されているか確認

- **view設定の問題**:
  - 最も限定的なview（通常は内部向け）を最初に定義しているか確認
  - match-clientsでクライアント識別が正しいか確認
  - viewごとにゾーンファイルを別のディレクトリに配置しているか確認
:::
```