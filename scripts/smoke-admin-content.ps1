$ErrorActionPreference = 'Stop'

$stackReadyScript = Join-Path $PSScriptRoot "assert-spring-stack-ready.ps1"
$base = & $stackReadyScript -PassThruUrl

function Headers([string]$token) {
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($token) {
    $headers['Authorization'] = "Bearer $token"
  }
  return $headers
}

$admin = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Headers (Headers '') -Body (
  @{
    email = 'admin@ivyts.dev'
    password = 'Password@123'
  } | ConvertTo-Json
)

$token = $admin.data.accessToken

$postSlug = 'admin-post-live-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
$postBody = @{
  title = "Admin post live $postSlug"
  slug = $postSlug
  excerpt = 'Post duoc tao tu admin workspace'
  content = "Doan 1 chi tiet ve bai viet.`n`nDoan 2 mo rong noi dung de du dieu kien publish."
  coverImage = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
  tags = @('toeic', 'admin', 'live')
  status = 'published'
  seoDescription = 'Bai viet publish that len blog'
} | ConvertTo-Json -Depth 10

$createdPost = Invoke-RestMethod -Method Post -Uri "$base/posts" -Headers (Headers $token) -Body $postBody
$publicPosts = Invoke-RestMethod -Method Get -Uri "$base/posts" -Headers (Headers '')
$postDetail = Invoke-RestMethod -Method Get -Uri "$base/posts/$postSlug" -Headers (Headers '')
$updatedPost = Invoke-RestMethod -Method Patch -Uri "$base/posts/$($createdPost.data.id)" -Headers (Headers $token) -Body (
  @{
    title = "Admin post updated $postSlug"
    excerpt = 'Post da duoc cap nhat tu admin workspace'
    content = "Noi dung moi sau khi update.`n`nVan du dieu kien publish that."
    status = 'published'
  } | ConvertTo-Json -Depth 10
)

$topicSlug = 'admin-ex-topic-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
$topicBody = @{
  slug = $topicSlug
  label = "Chu de admin $topicSlug"
  shortLabel = 'Admin topic'
  description = 'Chu de on tap do admin tao'
  accent = 'from-sky-500/20 via-cyan-400/10 to-emerald-400/20'
  keywords = @('admin', 'exercise')
  sections = @()
} | ConvertTo-Json -Depth 20

$createdTopic = Invoke-RestMethod -Method Post -Uri "$base/exercises/topics" -Headers (Headers $token) -Body $topicBody
$publicTopics = Invoke-RestMethod -Method Get -Uri "$base/exercises/topics" -Headers (Headers '')
$topicDetail = Invoke-RestMethod -Method Get -Uri "$base/exercises/topics/$topicSlug" -Headers (Headers '')
$updatedTopic = Invoke-RestMethod -Method Patch -Uri "$base/exercises/topics/$($createdTopic.data.id)" -Headers (Headers $token) -Body (
  @{
    slug = $topicSlug
    label = "Chu de admin updated $topicSlug"
    shortLabel = 'Admin topic'
    description = 'Chu de on tap da duoc cap nhat'
    accent = 'from-sky-500/20 via-cyan-400/10 to-emerald-400/20'
    keywords = @('admin', 'exercise', 'updated')
    sections = @()
  } | ConvertTo-Json -Depth 20
)

$itemBody = @{
  title = "Exercise item $topicSlug"
  description = 'Bai luyen tap cho topic moi'
  type = 'practice-set'
  level = 'beginner'
  durationMinutes = 10
  status = 'published'
  instructions = @('Lam trong 10 phut')
  isFeatured = $false
  assignedCourseIds = @()
  catalogKind = 'exercise'
  exerciseTopicSlug = $topicSlug
  questions = @(
    @{
      section = 'reading'
      prompt = 'Choose the correct answer'
      explanation = 'A is correct'
      options = @(
        @{ key = 'A'; text = 'Answer A'; isCorrect = $true },
        @{ key = 'B'; text = 'Answer B'; isCorrect = $false },
        @{ key = 'C'; text = 'Answer C'; isCorrect = $false },
        @{ key = 'D'; text = 'Answer D'; isCorrect = $false }
      )
      correctAnswer = 'A'
      audioUrl = $null
      imageUrl = $null
      points = 1
      order = 1
      level = 'easy'
    }
  )
} | ConvertTo-Json -Depth 30

$createdItem = Invoke-RestMethod -Method Post -Uri "$base/exercises/items" -Headers (Headers $token) -Body $itemBody
$publicItems = Invoke-RestMethod -Method Get -Uri "$base/exercises/items?topicSlug=$topicSlug" -Headers (Headers '')
$manageItems = Invoke-RestMethod -Method Get -Uri "$base/exercises/items/manage/mine" -Headers (Headers $token)
$updatedItem = Invoke-RestMethod -Method Patch -Uri "$base/exercises/items/$($createdItem.data.id)" -Headers (Headers $token) -Body (
  @{
    title = "Exercise item updated $topicSlug"
    description = 'Bai luyen tap da duoc cap nhat'
    type = 'practice-set'
    level = 'intermediate'
    durationMinutes = 12
    status = 'published'
    instructions = @('Lam trong 12 phut')
    isFeatured = $true
    assignedCourseIds = @()
    catalogKind = 'exercise'
    exerciseTopicSlug = $topicSlug
    questions = @(
      @{
        section = 'reading'
        prompt = 'Choose the updated correct answer'
        explanation = 'B is correct'
        options = @(
          @{ key = 'A'; text = 'Answer A'; isCorrect = $false },
          @{ key = 'B'; text = 'Answer B'; isCorrect = $true },
          @{ key = 'C'; text = 'Answer C'; isCorrect = $false },
          @{ key = 'D'; text = 'Answer D'; isCorrect = $false }
        )
        correctAnswer = 'B'
        audioUrl = $null
        imageUrl = $null
        points = 1
        order = 1
        level = 'easy'
      }
    )
  } | ConvertTo-Json -Depth 30
)

Invoke-RestMethod -Method Delete -Uri "$base/exercises/items/$($createdItem.data.id)" -Headers (Headers $token) | Out-Null
Invoke-RestMethod -Method Delete -Uri "$base/exercises/topics/$($createdTopic.data.id)" -Headers (Headers $token) | Out-Null
Invoke-RestMethod -Method Delete -Uri "$base/posts/$($createdPost.data.id)" -Headers (Headers $token) | Out-Null

$finalPublicPosts = Invoke-RestMethod -Method Get -Uri "$base/posts" -Headers (Headers '')
$finalPublicTopics = Invoke-RestMethod -Method Get -Uri "$base/exercises/topics" -Headers (Headers '')
$finalPublicItems = Invoke-RestMethod -Method Get -Uri "$base/exercises/items?topicSlug=$topicSlug" -Headers (Headers '')
$finalManageItems = Invoke-RestMethod -Method Get -Uri "$base/exercises/items/manage/mine" -Headers (Headers $token)

[pscustomobject]@{
  postCreated = $createdPost.data.slug
  postPublicVisible = ($publicPosts.data.slug -contains $postSlug)
  postDetailTitle = $postDetail.data.title
  postUpdatedTitle = $updatedPost.data.title
  topicCreated = $createdTopic.data.slug
  topicPublicVisible = ($publicTopics.data.slug -contains $topicSlug)
  topicSectionCount = $topicDetail.data.sections.Count
  topicUpdatedLabel = $updatedTopic.data.label
  itemCreated = $createdItem.data.title
  itemCatalogKind = $createdItem.data.catalogKind
  itemPublicVisible = ($publicItems.data.id -contains $createdItem.data.id)
  manageContainsItem = ($manageItems.data.id -contains $createdItem.data.id)
  itemUpdatedTitle = $updatedItem.data.title
  postDeleted = -not ($finalPublicPosts.data.slug -contains $postSlug)
  topicDeleted = -not ($finalPublicTopics.data.slug -contains $topicSlug)
  itemDeletedFromPublic = -not ($finalPublicItems.data.id -contains $createdItem.data.id)
  itemDeletedFromManage = -not ($finalManageItems.data.id -contains $createdItem.data.id)
} | ConvertTo-Json -Depth 10
