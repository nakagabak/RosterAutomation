import ResidentAvatar from '../ResidentAvatar'

export default function ResidentAvatarExample() {
  return (
    <div className="flex items-center gap-4">
      <ResidentAvatar name="Perpetua" size="sm" />
      <ResidentAvatar name="Eman" size="md" />
      <ResidentAvatar name="Allegra" size="lg" />
    </div>
  )
}
