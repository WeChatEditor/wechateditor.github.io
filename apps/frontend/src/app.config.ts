export const storageName = 'jlab-wechat-editor'
export const maxMarkdownLength = 500_000
export const exampleMarkdown = `> [!hero] 内容工作札记 · VOL. 01
>
> # 写完之后，让观点被看见
>
> 一篇文章的阅读体验，藏在标题、留白与重点之间。

> [!summary] 发布前，检查这三件事
>
> - 标题是否说清文章的主题
> - 每一节是否只解释一个重点
> - 结尾是否留下可以采取的行动

上面两张卡片只用一个标记，里面仍然是熟悉的标题、段落和列表。点击原稿工具栏的「封面卡」「总结卡」，可以直接插入；先选中几行文字，再点击，就能把内容整理成卡片。

在「标题样式」下方，可以更换刊头符号、填写品牌落款，留空就隐藏。颜色跟随当前配色；普通引用仍保持引用样式。

### 卡片这样写

\`\`\`markdown
> [!hero] 你的栏目名称
>
> # 文章主标题
>
> 一句简短的副标题。

> [!summary] 读完带走这些重点
>
> - 第一个重点
> - 第二个重点，可以使用 **加粗**
\`\`\`

标记与正文之间留一行 \`>\`，引用块结束后留一个空行，再继续普通正文。封面内使用一级标题，总结内使用列表；没有这些结构时，会保留为普通引用。

---

# 把想法，排成好文章

桀士排版 · 写作与色彩手记

## 让内容，有自己的气质

用 **朱砂色标记重点**，用深青黛安放标题。正文留一点呼吸，\`Markdown\` 也能有杂志的阅读节奏。

> 好的配色，像一句恰到好处的话。
> 不喧哗，也能让人记住。

### 从一处细节开始

- **标题有层次**，长文就有了路标。
- 引用留浅底，让摘录安静地停一停。

---

## 换一组颜色，换一种语气

这页开场用「青黛朱砂」呈现五种颜色的分工：深色正文、青黛标题、朱砂强调、灰调引用与暖纸底色。打开「配色」，同一段文字可以换成另外一种气质；颜色切换以后，下面的标题、引用、表格和代码也方便一起比较。

| 想写的内容 | 可以试试的配色 |
| --- | --- |
| 专栏、访谈、设计观察 | **青黛朱砂**、玫瑰晨报、摩卡手札 |
| 随笔、生活与自然 | 松间青绿、雨后青瓷、橄榄手记 |
| 产品、技术与知识分享 | 澄空科技、极光青紫、靛蓝档案 |
| 展览、旅行与灵感记录 | 蓝柠撞色、落日橘蓝、玫瑰莓紫 |

内置18套配色，连同自己保存的方案，最多可保留24套。每套都能改名、更新颜色或删除；「重置所有配色」会在确认后恢复内置列表，重新点击卡片即可应用。

### 给章节选一个好看的开场

打开「标题样式」试试这四种新样式：**杂志刊头**用衬线和细底线组织章节；**色签标题**把标题放进一块醒目的颜色；**双线专栏**用上下线条留出专栏感；**极简细线**只留下轻轻的一笔。原有下划线、竖线、斜线、方括号、双圆与点阵也都保留。

编号、对齐方式和「紧贴标题」可以独立调整。配色与标题样式自由搭配，不必为了一种颜色放弃喜欢的标题。

下面保留了完整的Markdown写法、多语言文字和代码示例。这是一篇可以直接编辑的稿子：左侧写作，右侧看效果；改一句话、换一组颜色，再慢慢找到适合自己的节奏。

## 让文字自然呼吸

排版的第一步，是让阅读轻松一点。把一个很长的段落分开，让每一段只讲清楚一件事；需要提醒读者的地方，再用加粗、引用或颜色把重点留出来。

**好的表达值得被看见。** 字号、间距与字体，都可以在「文字设置」里调整。试着把正文放大一点，再观察段落之间的距离，找到适合自己文章的节奏。

选中右侧预览中的普通正文，会出现局部配色气泡。给这一句换个颜色，再看看它与前后文的关系。顶栏的「正文色」控制正文颜色，「强调色」可以帮助整篇文章保持统一的重点色。

### 一句话，也可以有不同语气

这是普通正文，适合把事情平实地讲清楚。

这是 **加粗的重点**，适合放一个结论或需要记住的词。

这是 *轻一点的强调*，可以用来写书名、补充说明或一句旁白。

这是 ~~已经修改的旧说法~~，也可以保留修改前后的对照。

在段落里提到文件名、命令或字段时，可以使用行内代码，例如 \`article.md\`、\`title\` 和 \`print("Hello")\`。

> 不急着堆满装饰，先让每一段内容站稳。
>
> 引用可以是一句话，也可以是几段补充。把它与正文分开，读者就更容易分辨叙述和引述。

### 从标题看清文章结构

文章大标题使用一个井号，章节标题使用两个井号，小节标题使用三个井号。左侧调整标题文字，右侧会同步更新。

#### 更细的一层说明

这一段展示四级标题。只有确实需要继续细分时再使用，让结构与内容的复杂程度相匹配。

打开「标题样式」，可以尝试不同的章节装饰、对齐方式和独立编号。同一份原稿换一个标题样式，就能比较偏简洁与偏醒目的阅读效果。

## 用列表和表格整理信息

一段话里如果有几个并列要点，可以写成列表：

- 先说明文章想解决什么问题。
- 再补上读者需要知道的背景。
- 用具体例子解释关键步骤。
  - 例子短一些，更容易跟着阅读。
  - 有先后顺序的操作，可以另用有序列表。
- 最后给出实际结果或下一步。

有明确次序时，让序号带着读者走：

1. 在左侧写下第一段 Markdown。
2. 在右侧确认标题、段落和强调的效果。
3. 调整文字设置，再选择一组配色。
4. 切换手机与电脑预览，检查长句和表格。
5. 发布前复制到公众号，在后台粘贴并确认效果。

### 把需要比较的内容放在一起

| 内容 | 示例 | 适合什么时候使用 |
| --- | --- | --- |
| 正文 | 一段完整的说明 | 讲清背景、过程与结果 |
| 加粗 | **关键结论** | 提醒读者留意重点 |
| 引用 | 一句摘录或补充 | 区分引述与自己的叙述 |
| 列表 | 几个并列要点 | 整理材料或说明步骤 |
| 表格 | 多项内容对照 | 比较方案、参数或安排 |
| 代码 | \`print("Hello")\` | 展示命令、配置和程序片段 |

表格里的文字也可以很长。比如这一句用于观察手机阅读宽度下，较长的内容怎样换行；写自己的文章时，可以试着缩短列名和单元格内容，让信息更容易扫读。

---

分隔线可以给文章留一个停顿。上下留出空行，再开始下一个话题。

## 同一篇文章，容得下不同语言

中文说明、英文术语、日文引述或多语言问候，都可以写在原稿里。下面这些短句方便你比较不同文字的字形、标点、行距和换行，也可以换成自己的双语内容。

### 简体中文与繁體中文

**简体中文：** 你好，欢迎来到桀士排版。把今天的想法写下来，再慢慢整理成一篇好文章。

**繁體中文：** 你好，歡迎來到桀士排版。把今天的想法寫下來，再慢慢整理成一篇好文章。

### English · 英语

Hello, and welcome. Start with a small idea, give it a clear structure, and leave enough space for your readers to follow along.

### 日本語 · 日语

こんにちは。今日の小さな気づきを書き留めて、自分の言葉で伝えてみましょう。

### 한국어 · 韩语

안녕하세요. 오늘 떠오른 생각을 적고, 읽기 편한 글로 차근차근 다듬어 보세요.

### Français · 法语

Bonjour ! Prenez le temps de noter vos idées, puis organisez-les pour rendre la lecture agréable.

### Deutsch · 德语

Hallo! Schreibe deine Gedanken auf und gib jedem Absatz einen klaren Platz in deinem Text.

### Español · 西班牙语

¡Hola! Escribe una idea, ordénala con calma y dale espacio para que otras personas puedan seguirla.

### Português · 葡萄牙语

Olá! Comece com uma ideia simples e organize o texto para tornar a leitura mais agradável.

### Italiano · 意大利语

Ciao! Parti da una piccola idea e trasformala, passo dopo passo, in un testo chiaro e piacevole.

### Русский · 俄语

Здравствуйте! Запишите свою идею и разделите текст на понятные абзацы, чтобы его было удобно читать.

### العربية · 阿拉伯语

مرحبًا! اكتب فكرتك الأولى، ثم رتّب النص في فقرات واضحة وسهلة القراءة.

### हिन्दी · 印地语

नमस्ते! अपने विचार लिखिए और उन्हें छोटे, स्पष्ट अनुच्छेदों में व्यवस्थित कीजिए।

### ไทย · 泰语

สวัสดี! เริ่มจากความคิดเล็ก ๆ แล้วค่อย ๆ เรียบเรียงเป็นบทความที่อ่านได้สบาย

### Tiếng Việt · 越南语

Xin chào! Hãy ghi lại ý tưởng của bạn và sắp xếp thành những đoạn văn rõ ràng, dễ đọc.

### Bahasa Indonesia · 印度尼西亚语

Halo! Mulailah dari satu ide sederhana, lalu susun menjadi tulisan yang nyaman dibaca.

### 混合文字与标点

今天的主题是「写作与排版 / Writing & Typesetting」。你可以在一句话里写 API、Vue 3、Markdown、2026 年和 1080 × 1920，也可以放入 café、naïve、résumé 等带重音的词。

下面是一段较长的中英混排示例：写技术文章时，第一次出现 application programming interface（API），可以先解释含义；后面继续使用 API，读者就不必在每一段都重新认识这个词。排版时观察英文与数字的间隔，再决定要不要调整字号与行距。

## 给代码留一点空间

代码块适合展示多行程序、配置或命令。下面用常见语言各放一段短例子，方便你查看缩进、引号、符号与长行的显示效果。

写法是在代码前后各放一行三个反引号，第一行后面可以接语言名称。这些片段用于展示文章排版；你可以把内容替换成自己的代码。

### Markdown：原稿本身的写法

\`\`\`markdown
# 我的文章标题

## 第一个章节

这里是正文，**这里是重点**，也可以写行内代码。

- 一个要点
- 另一个要点

> 一句值得单独留下的话。
\`\`\`

### TypeScript

\`\`\`typescript
type Article = { title: string; published: boolean }

function describeArticle(article: Article): string {
  return article.title + (article.published ? ' · 已发布' : ' · 草稿')
}

console.log(describeArticle({ title: '把想法，排成好文章', published: false }))
\`\`\`

### JavaScript

\`\`\`javascript
const ideas = ['观察', '记录', '整理']

function makeOutline(items) {
  return items.map((item, index) => (index + 1) + '. ' + item)
}

console.log(makeOutline(ideas).join('\\n'))
\`\`\`

### Python

\`\`\`python
def greet(name: str) -> str:
    return f"你好，{name}"


for reader in ["写作者", "新朋友"]:
    print(greet(reader))
\`\`\`

### Java

\`\`\`java
public class Welcome {
    public static void main(String[] args) {
        String title = "把想法，排成好文章";
        System.out.println(title);
    }
}
\`\`\`

### Kotlin

\`\`\`kotlin
data class Article(val title: String)

fun main() {
    val article = Article("把想法，排成好文章")
    println(article.title)
}
\`\`\`

### Swift

\`\`\`swift
struct Article {
    let title: String
}

let article = Article(title: "把想法，排成好文章")
print(article.title)
\`\`\`

### Go

\`\`\`go
package main

import "fmt"

func main() {
    title := "把想法，排成好文章"
    fmt.Println(title)
}
\`\`\`

### Rust

\`\`\`rust
fn main() {
    let ideas = ["观察", "记录", "整理"];
    for idea in ideas {
        println!("{}", idea);
    }
}
\`\`\`

### C

\`\`\`c
#include <stdio.h>

int main(void) {
    puts("Hello, writer!");
    return 0;
}
\`\`\`

### C++

\`\`\`cpp
#include <iostream>
#include <string>

int main() {
    const std::string title = "Hello, writer!";
    std::cout << title << std::endl;
    return 0;
}
\`\`\`

### C#

\`\`\`csharp
using System;

class Welcome
{
    static void Main()
    {
        Console.WriteLine("把想法，排成好文章");
    }
}
\`\`\`

### PHP

\`\`\`php
<?php
$ideas = ["观察", "记录", "整理"];
foreach ($ideas as $idea) {
    echo $idea . PHP_EOL;
}
\`\`\`

### Ruby

\`\`\`ruby
def greet(name)
  "你好，" + name
end

puts greet("写作者")
\`\`\`

### Lua

\`\`\`lua
local ideas = { "观察", "记录", "整理" }

for index, idea in ipairs(ideas) do
    print(index, idea)
end
\`\`\`

### R

\`\`\`r
ideas <- c("观察", "记录", "整理")
outline <- data.frame(step = seq_along(ideas), idea = ideas)
print(outline)
\`\`\`

### Dart

\`\`\`dart
void main() {
  final ideas = ['观察', '记录', '整理'];
  for (final idea in ideas) {
    print(idea);
  }
}
\`\`\`

## 网页、数据和配置，也可以写清楚

技术文章除了程序，还常常需要放一段网页结构、数据或配置。继续往下看，可以比较尖括号、花括号、缩进和不同的注释形式。

### HTML

\`\`\`html
<article>
  <h1>把想法，排成好文章</h1>
  <p>从一段 Markdown 开始。</p>
  <a href="https://example.com/article">示例文章链接</a>
</article>
\`\`\`

### CSS

\`\`\`css
.article {
  color: #334155;
  font-size: 16px;
  line-height: 1.8;
}

.article h2 {
  margin-top: 2em;
  color: #2563eb;
}
\`\`\`

### JSON

\`\`\`json
{
  "title": "把想法，排成好文章",
  "language": "zh-CN",
  "tags": ["写作", "排版", "Markdown"],
  "published": false
}
\`\`\`

### YAML

\`\`\`yaml
article:
  title: 把想法，排成好文章
  language: zh-CN
  tags:
    - 写作
    - 排版
  published: false
\`\`\`

### TOML

\`\`\`toml
[article]
title = "把想法，排成好文章"
language = "zh-CN"
tags = ["写作", "排版"]
published = false
\`\`\`

### XML

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<article language="zh-CN">
  <title>把想法，排成好文章</title>
  <published>false</published>
</article>
\`\`\`

### SQL

\`\`\`sql
SELECT title, created_at
FROM articles
WHERE published = false
ORDER BY created_at DESC
LIMIT 5;
\`\`\`

### GraphQL

\`\`\`graphql
query LatestArticles {
  articles(limit: 5) {
    title
    published
  }
}
\`\`\`

### Bash

\`\`\`bash
article_title='把想法，排成好文章'
printf '%s\\n' "$article_title"
\`\`\`

### PowerShell

\`\`\`powershell
$articleTitle = '把想法，排成好文章'
$ideas = @('观察', '记录', '整理')
Write-Output $articleTitle
$ideas | ForEach-Object { Write-Output $_ }
\`\`\`

### Dockerfile

\`\`\`dockerfile
# 示例：将本地静态页面放入容器
FROM nginx:alpine
COPY ./site/ /usr/share/nginx/html/
EXPOSE 80
\`\`\`

### Diff：展示修改前后

\`\`\`diff
- 标题：一段还没整理的想法
+ 标题：把想法，排成好文章
- 状态：等待补充
+ 状态：初稿完成
\`\`\`

### 纯文本：日志和终端输出

\`\`\`plaintext
[09:00] 开始记录想法
[09:15] 整理文章结构
[09:30] 检查标题、段落与排版
Result: draft ready
\`\`\`

## 让这篇示例变成你的文章

读到这里，可以回到左侧，把大标题换成自己的题目，再删去暂时用不到的段落。先保留一个小节，写下真实的观察、一次实践，或一个想分享的故事。

### 换一组配色

打开「配色」，点选一组喜欢的颜色，再比较正文、标题、引用和表格的变化。也可以修改配色名称、更新颜色，逐渐留下适合自己的组合。

同一篇文章可以先保持一组主色。需要局部强调时，选中右侧的普通正文，再用配色气泡处理。这样阅读时，重点会更容易找到。

### 在手机与电脑宽度里读一遍

在「公众号预览」标题栏切换手机与电脑模式，看看长句、表格和代码块在不同宽度里的表现。开启阅读外壳后，可以更集中地观察文章；开启「同步滚动」，左右两边会跟随正文位置联动。

这篇示例特意保留了较长的段落和多种字符。你可以用它比较字号与行距，再检查代码缩进和表格换行，找到舒服的阅读状态。

### 留下固定开头与结尾

如果每篇文章都有相同的开场或署名，可以在「固定头尾」里分别设置开头与结尾，并按需要启用。修改正文时，就可以专心处理这一篇文章的内容。

例如，开头可以写“这里记录我的学习与实践”，结尾可以放作者署名或一段简短的补充。启用后，右侧预览会把它们与正文一起呈现。

### 保存当前进度，也保留重要版本

每次修改都会尝试保存到当前浏览器，保存状态显示在顶栏。写到一个值得留下的阶段，可以打开「历史版本」，主动点击「新增版本」，保存这一版文章。

历史版本记录文章内容；当前的配色、文字设置与固定头尾继续按自己的配置使用。你也可以复制左侧原稿到本地 Markdown 文件，留一份方便带走的备份。

## 从写作到发布

发布前，再用读者的视角检查一次：标题有没有说清主题，段落是否容易跟上，引用和重点是否放在合适的位置，代码与表格是否完整。

1. 在右侧通读全文，检查标题、错字与段落。
2. 切换手机预览，看看长句和表格的换行。
3. 使用「复制到公众号」，到公众号后台粘贴。
4. 在后台确认排版、链接和内容，再手动保存。
5. 保存后重新查看，确认最终文章符合预期。

安装并连接传稿插件后，也可以使用「发送到公众号」尝试传入文字排版；传入后仍需要在公众号后台检查并手动保存。

链接可以这样写：[示例文章链接](https://example.com/article)。这里的地址只是演示，写自己的文章时请替换成实际地址；复制到公众号后，再确认读者能看见和使用的最终链接。

> 从一句话开始，慢慢把它写清楚。
>
> 等内容站稳，再给它合适的颜色与留白。

现在，试着把这段结尾换成自己的话吧。
`
