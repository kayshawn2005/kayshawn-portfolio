import { Booth } from './Booth'
import { Cafe } from './Cafe'
import { Classroom } from './Classroom'
import { Guide } from './Guide'
import { PoolChapter } from './Pool'
import { StoryStage } from './StoryStage'
import { Sunrise } from './Sunrise'

/** The home page: one summer night, from a phone booth in the rain to sunrise at the sea. */
export function StoryPage() {
  return (
    <main className="story">
      <StoryStage />
      <Booth />
      <Cafe />
      <Classroom />
      <PoolChapter />
      <Sunrise />
      <Guide />
    </main>
  )
}
